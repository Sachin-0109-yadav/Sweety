
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Droplets,
  LoaderCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Dashboard() {
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/reports?period=monthToDate");
      setReport(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your health dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const readings = report?.readings || [];
  const summary = report?.summary || {};

  const chartData = useMemo(
    () =>
      [...readings].reverse().map((reading) => ({
        date: String(reading.reading_date).slice(5, 10),
        glucose: Number(reading.glucose_level),
        slot: reading.reading_slot,
      })),
    [readings]
  );

  const formatDate = (date) => {
    if (!date) return "—";

    const [year, month, day] = String(date).slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-breadcrumb">
              Workspace / Overview
            </span>
            <h1>Dashboard</h1>
          </div>

          <button
            className="dashboard-refresh"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-greeting">
            <div>
              <span className="dashboard-eyebrow">
                YOUR HEALTH OVERVIEW
              </span>

              <h2>
                Welcome back, {user?.name?.split(" ")[0] || "there"}!
              </h2>

              <p>
                Here's an overview of your glucose tracking activity
                this month.
              </p>
            </div>

            <div className="dashboard-date">
              <CalendarDays size={18} />
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </section>

          {error && (
            <div className="dashboard-error" role="alert">
              {error}
              <button onClick={loadDashboard}>Try again</button>
            </div>
          )}

          {loading ? (
            <div className="dashboard-loading">
              <LoaderCircle className="loading-spinner" size={30} />
              <p>Loading your health overview...</p>
            </div>
          ) : (
            <>
              <section className="dashboard-stats">
                <article className="dashboard-stat-card">
                  <div className="stat-card-top">
                    <span>Total readings</span>
                    <div className="stat-card-icon blue">
                      <Activity size={20} />
                    </div>
                  </div>
                  <strong>{summary.totalReadings ?? 0}</strong>
                  <span className="stat-card-caption">
                    Recorded this month
                  </span>
                </article>

                <article className="dashboard-stat-card">
                  <div className="stat-card-top">
                    <span>Average glucose</span>
                    <div className="stat-card-icon purple">
                      <Droplets size={20} />
                    </div>
                  </div>
                  <strong>
                    {summary.averageGlucose ?? "—"}
                    {summary.averageGlucose != null && (
                      <small> mg/dL</small>
                    )}
                  </strong>
                  <span className="stat-card-caption">
                    Monthly average
                  </span>
                </article>

                <article className="dashboard-stat-card">
                  <div className="stat-card-top">
                    <span>Highest reading</span>
                    <div className="stat-card-icon orange">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                  <strong>
                    {summary.highestGlucose ?? "—"}
                    {summary.highestGlucose != null && (
                      <small> mg/dL</small>
                    )}
                  </strong>
                  <span className="stat-card-caption">
                    Highest recorded value
                  </span>
                </article>

                <article className="dashboard-stat-card">
                  <div className="stat-card-top">
                    <span>Lowest reading</span>
                    <div className="stat-card-icon green">
                      <ArrowDownRight size={20} />
                    </div>
                  </div>
                  <strong>
                    {summary.lowestGlucose ?? "—"}
                    {summary.lowestGlucose != null && (
                      <small> mg/dL</small>
                    )}
                  </strong>
                  <span className="stat-card-caption">
                    Lowest recorded value
                  </span>
                </article>
              </section>

              <section className="dashboard-panels">
                <article className="dashboard-panel glucose-chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Glucose overview</h3>
                      <p>Your recorded readings this month</p>
                    </div>
                    <span className="panel-period">This month</span>
                  </div>

                  {chartData.length > 0 ? (
                    <div className="glucose-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{
                            top: 15,
                            right: 15,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            width={45}
                          />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="glucose"
                            name="Glucose"
                            stroke="#5685f5"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="chart-empty">
                      <div className="empty-icon">
                        <TrendingUp size={28} />
                      </div>
                      <h4>No readings to display yet</h4>
                      <p>
                        Your glucose chart will appear here after
                        you record your first reading.
                      </p>
                    </div>
                  )}
                </article>

                <article className="dashboard-panel recent-readings-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Recent readings</h3>
                      <p>Your latest recorded entries</p>
                    </div>
                  </div>

                  {readings.length > 0 ? (
                    <div className="recent-readings-list">
                      {readings.slice(0, 5).map((reading) => (
                        <div
                          className="recent-reading-item"
                          key={reading.id}
                        >
                          <div className="reading-icon">
                            <Droplets size={18} />
                          </div>

                          <div className="reading-details">
                            <strong>{reading.reading_slot}</strong>
                            <span>
                              {formatDate(reading.reading_date)}
                            </span>
                          </div>

                          <div className="reading-value">
                            {reading.glucose_level}
                            <small>mg/dL</small>
                          </div>
                        </div>
                      ))
                    }
                    </div>
                  ) : (
                    <div className="recent-empty">
                      <p>No readings recorded this month.</p>
                    </div>
                  )}
                </article>
              </section>

              <p className="dashboard-disclaimer">
                Sweety is a tracking and analytics tool, not a medical
                diagnosis system. Consult your healthcare professional
                when interpreting your results.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
