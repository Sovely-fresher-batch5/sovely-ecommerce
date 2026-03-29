import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Revenue & Order Trends (Last 30 Days)
    const revenueTrend = await Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'CANCELLED' } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                // FIX: Changed $totalAmount to $totalPlatformCost
                revenue: { $sum: '$totalPlatformCost' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const trendMap = new Map(revenueTrend.map((item) => [item._id, item]));
    const completeRevenueTrend = [];

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];

        const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        const dayData = trendMap.get(dateString);

        completeRevenueTrend.push({
            date: displayDate,
            Revenue: dayData?.revenue || 0,
            Orders: dayData?.orders || 0,
        });
    }

    // 2. Order Status Distribution
    const orderStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    // 3. Inventory Health (Excluding soft-deleted products)
    const inventoryHealth = await Product.aggregate([
        // FIX: Ignore archived/deleted products in the health report
        { $match: { deletedAt: null } },
        {
            $project: {
                stockStatus: {
                    $cond: {
                        if: { $eq: ['$inventory.stock', 0] },
                        then: 'Out of Stock',
                        else: {
                            $cond: {
                                if: { $lte: ['$inventory.stock', '$inventory.alertThreshold'] }, // Dynamic check instead of hardcoded 10
                                then: 'Low Stock',
                                else: 'In Stock',
                            },
                        },
                    },
                },
            },
        },
        { $group: { _id: '$stockStatus', count: { $sum: 1 } } },
    ]);

    // 4. Lifetime Platform KPIs
    const totalRevenueAgg = await Order.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        // FIX: Changed $totalAmount to $totalPlatformCost
        { $group: { _id: null, total: { $sum: '$totalPlatformCost' } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // FIX: Optimized to count ALL resellers representing real user growth (not just active ones)
    const totalCustomers = await User.countDocuments({
        role: 'RESELLER',
        deletedAt: null,
    });

    const processingOrders = await Order.countDocuments({ status: 'PROCESSING' });

    // NEW: Count Pending KYC applications for the admin to review
    const pendingKycCount = await User.countDocuments({
        role: 'RESELLER',
        kycStatus: 'PENDING',
        isActive: true,
        deletedAt: null,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                kpis: { totalRevenue, totalCustomers, processingOrders, pendingKycCount },
                revenueTrend: completeRevenueTrend,
                orderStatus: orderStatus.map((item) => ({ name: item._id, value: item.count })),
                inventoryHealth: inventoryHealth.map((item) => ({
                    name: item._id,
                    value: item.count,
                })),
            },
            'Analytics fetched successfully'
        )
    );
});

// Add this export to your analytics.controller.js
export const getResellerAnalytics = asyncHandler(async (req, res) => {
    const resellerId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Lifetime & Operational KPIs
    const kpiAggregation = await Order.aggregate([
        { $match: { resellerId: resellerId } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                // Realized profit (money in their wallet/bank)
                realizedProfit: {
                    $sum: {
                        $cond: [
                            { $eq: ['$status', 'PROFIT_CREDITED'] },
                            '$resellerProfitMargin',
                            0,
                        ],
                    },
                },
                // Pending profit (shipped/delivered but not yet remitted)
                pendingProfit: {
                    $sum: {
                        $cond: [
                            { $in: ['$status', ['SHIPPED', 'DELIVERED', 'PROCESSING']] },
                            '$resellerProfitMargin',
                            0,
                        ],
                    },
                },
                rtoOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'RTO'] }, 1, 0] },
                },
                ndrActionRequired: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$status', 'NDR'] },
                                    { $eq: ['$ndrDetails.resellerAction', 'PENDING'] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    const kpis = kpiAggregation[0] || {
        totalOrders: 0,
        realizedProfit: 0,
        pendingProfit: 0,
        rtoOrders: 0,
        ndrActionRequired: 0,
    };

    const rtoRate =
        kpis.totalOrders > 0 ? Math.round((kpis.rtoOrders / kpis.totalOrders) * 100) : 0;

    // 2. 30-Day Profit Trend
    const trendAggregation = await Order.aggregate([
        {
            $match: {
                resellerId: resellerId,
                createdAt: { $gte: thirtyDaysAgo },
                status: { $ne: 'CANCELLED' },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                dailyProfit: { $sum: '$resellerProfitMargin' },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Format trend data for the frontend graph
    const trendMap = new Map(trendAggregation.map((item) => [item._id, item.dailyProfit]));
    const profitTrend = [];
    for (let i = 14; i >= 0; i--) {
        // Sending 15 days of data for a cleaner UI chart
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        profitTrend.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            profit: trendMap.get(dateString) || 0,
        });
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                kpis: {
                    realizedProfit: kpis.realizedProfit,
                    pendingProfit: kpis.pendingProfit,
                    rtoRate,
                    ndrActionRequired: kpis.ndrActionRequired,
                },
                profitTrend,
            },
            'Reseller analytics fetched successfully'
        )
    );
});
