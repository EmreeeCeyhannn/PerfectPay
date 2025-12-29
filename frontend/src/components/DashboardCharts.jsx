import React, { useEffect, useState } from "react";
import "./DashboardCharts.css";

export default function DashboardCharts({ stats }) {
    const [chartData, setChartData] = useState({
        dailyVolume: [],
        pspPerformance: []
    });

    useEffect(() => {
        // Generate sample data for charts (in production, fetch from API)
        generateChartData();
    }, [stats]);

    const generateChartData = () => {
        // Daily Volume Data (last 7 days)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dailyVolume = days.map((day, index) => ({
            day,
            volume: Math.floor(Math.random() * 10000) + 2000,
            transactions: Math.floor(Math.random() * 50) + 10
        }));

        // PSP Performance Data
        const pspPerformance = [
            { name: 'Stripe', successRate: 98.5, volume: 45000, color: '#667eea' },
            { name: 'Wise', successRate: 97.2, volume: 32000, color: '#48bb78' },
            { name: 'PayPal', successRate: 96.8, volume: 28000, color: '#4299e1' },
            { name: 'Iyzico', successRate: 99.1, volume: 15000, color: '#ed8936' }
        ];

        setChartData({ dailyVolume, pspPerformance });
    };

    const maxVolume = Math.max(...chartData.dailyVolume.map(d => d.volume), 1);
    const maxPspVolume = Math.max(...chartData.pspPerformance.map(p => p.volume), 1);

    return (
        <div className="dashboard-charts">
            <div className="charts-grid">
                {/* Daily Transaction Volume Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <span className="chart-icon">📊</span>
                        Daily Transaction Volume
                    </h3>
                    <div className="bar-chart">
                        {chartData.dailyVolume.map((item, index) => (
                            <div key={index} className="bar-item">
                                <div className="bar-container">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${(item.volume / maxVolume) * 100}%`,
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                    >
                                        <span className="bar-value">${(item.volume / 1000).toFixed(1)}k</span>
                                    </div>
                                </div>
                                <span className="bar-label">{item.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="chart-legend">
                        <span>💰 Total: ${chartData.dailyVolume.reduce((sum, d) => sum + d.volume, 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* PSP Performance Comparison */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <span className="chart-icon">🏆</span>
                        PSP Performance
                    </h3>
                    <div className="psp-chart">
                        {chartData.pspPerformance.map((psp, index) => (
                            <div key={index} className="psp-item">
                                <div className="psp-header">
                                    <span className="psp-name">{psp.name}</span>
                                    <span className="psp-success-rate">{psp.successRate}%</span>
                                </div>
                                <div className="psp-bar-container">
                                    <div
                                        className="psp-bar"
                                        style={{
                                            width: `${(psp.volume / maxPspVolume) * 100}%`,
                                            backgroundColor: psp.color,
                                            animationDelay: `${index * 0.15}s`
                                        }}
                                    ></div>
                                </div>
                                <div className="psp-stats">
                                    <span className="psp-volume">${(psp.volume / 1000).toFixed(1)}k volume</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Success Rate Donut Chart */}
                <div className="chart-card donut-card">
                    <h3 className="chart-title">
                        <span className="chart-icon">✅</span>
                        Overall Success Rate
                    </h3>
                    <div className="donut-chart">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                            <path
                                className="circle-bg"
                                d="M18 2.0845
                                   a 15.9155 15.9155 0 0 1 0 31.831
                                   a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="circle"
                                strokeDasharray="97.5, 100"
                                d="M18 2.0845
                                   a 15.9155 15.9155 0 0 1 0 31.831
                                   a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" className="percentage">97.5%</text>
                        </svg>
                        <p className="donut-label">Successful Transactions</p>
                    </div>
                </div>

                {/* Transaction Types Breakdown */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <span className="chart-icon">💳</span>
                        Transaction Types
                    </h3>
                    <div className="type-breakdown">
                        <div className="type-item">
                            <div className="type-info">
                                <span className="type-icon">🔄</span>
                                <span className="type-name">P2P Transfers</span>
                            </div>
                            <div className="type-bar-container">
                                <div className="type-bar" style={{ width: '65%', backgroundColor: '#667eea' }}></div>
                            </div>
                            <span className="type-percentage">65%</span>
                        </div>
                        <div className="type-item">
                            <div className="type-info">
                                <span className="type-icon">💳</span>
                                <span className="type-name">Card Payments</span>
                            </div>
                            <div className="type-bar-container">
                                <div className="type-bar" style={{ width: '25%', backgroundColor: '#48bb78' }}></div>
                            </div>
                            <span className="type-percentage">25%</span>
                        </div>
                        <div className="type-item">
                            <div className="type-info">
                                <span className="type-icon">🌍</span>
                                <span className="type-name">International</span>
                            </div>
                            <div className="type-bar-container">
                                <div className="type-bar" style={{ width: '10%', backgroundColor: '#ed8936' }}></div>
                            </div>
                            <span className="type-percentage">10%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
