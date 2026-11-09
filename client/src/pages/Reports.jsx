
import { useEffect, useState } from "react";
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
import { NavLink } from "react-router-dom";
import api from "../services/api";

const periods = [
  { value: "daily", label: "Today" },
  { value: "monthToDate", label: "This month" },
  { value: "previousMonth", label: "Previous month" },
];

function Reports() {
  const [period, setPeriod] = useState("monthToDate");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async (selectedPeriod = period) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/reports?period=${selectedPeriod}`
      );
      setReport(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your health report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(period);
  }, [period]);

  const summary = report?.summary || {};
  const readings = report?.readings || [];

  const chartData = [...readings]
    .reverse()
    .map((reading) => ({
      date: String(reading.reading_date).slice(5, 10),
      glucose: Number(reading.glucose_level),
      slot: reading.reading_slot,
    }));

  const formatDate = (date) => {
    if (!date) return "—";

    const [year, month, day] = String(date)
      .slice(0, 10)
      .split("-");

    return `${day}/${month}/${year}`;
  };

  return (
    <main className="reports-page">
      <header className="reports-header">
        <div>
          <span className="reports-eyebrow">
            SWEETY / ANALYTICS
          </span>
          <h1>Health Reports</h1>
          <p>
            Understand your glucose tracking history through
            summaries and visual trends.
          </p>
        </div>

        <button
          className="reports-refresh"
          onClick={() => loadReport()}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className="reports-toolbar">
        <div>
          <CalendarDays size={19} />
          <span>Report period</span>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          aria-label="Select report period"
        >
          {periods.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      {error && (
        <div className="reports-error" role="alert">
          {error}
          <button onClick={() => loadReport()}>Try again</button>
        </div>
      )}

      {loading ? (
        <div className="reports-loading">
          <LoaderCircle size={32} className="loading-spinner" />
          <p>Preparing your health report...</p>
        </div>
      ) : (
        <>
          <section className="reports-stats">
            <article className="report-stat-card">
              <div className="report-stat-icon blue">
                <Activity size={21} />
              </div>
              <span>Total readings</span>
              <strong>{summary.totalReadings ?? 0}</strong>
              <small>Entries in selected period</small>
            </article>

            <article className="report-stat-card">
              <div className="report-stat-icon purple">
                <Droplets size={21} />
              </div>
              <span>Average glucose</span>
              <strong>
                {summary.averageGlucose ?? "—"}
                {summary.averageGlucose != null && (
                  <small> mg/dL</small>
                )}
              </strong>
              <small>Average recorded value</small>
            </article>

            <article className="report-stat-card">
              <div className="report-stat-icon orange">
                <ArrowUpRight size={21} />
              </div>
              <span>Highest reading</span>
              <strong>
                {summary.highestGlucose ?? "—"}
                {summary.highestGlucose != null && (
                  <small> mg/dL</small>
                )}
              </strong>
              <small>Maximum recorded value</small>
            </article>

            <article className="report-stat-card">
              <div className="report-stat-icon green">
                <ArrowDownRight size={21} />
              </div>
              <span>Lowest reading</span>
              <strong>
                {summary.lowestGlucose ?? "—"}
                {summary.lowestGlucose != null && (
                  <small> mg/dL</small>
                )}
              </strong>
              <small>Minimum recorded value</small>
            </article>
          </section>

          <section className="reports-chart-panel">
            <div className="reports-panel-heading">
              <div>
                <h2>Glucose trends</h2>
                <p>
                  Recorded glucose values over the selected period
                </p>
              </div>

              <span>
                <TrendingUp size={16} />
                {periods.find((item) => item.value === period)?.label}
              </span>
            </div>

            {chartData.length > 0 ? (
              <div className="reports-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 15,
                      right: 20,
                      left: 5,
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
              <div className="reports-empty">
                <TrendingUp size={32} />
                <h3>No readings available</h3>
                <p>
                  Add glucose readings to see your trends for
                  this period.
                </p>
                <NavLink to="/readings">
                  Add a glucose reading
                </NavLink>
              </div>
            )}
          </section>

          <section className="reports-history-panel">
            <div className="reports-panel-heading">
              <div>
                <h2>Reading history</h2>
                <p>
                  {readings.length} reading(s) in this report
                </p>
              </div>
            </div>

            {readings.length > 0 ? (
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reading slot</th>
                      <th>Glucose level</th>
                    </tr>
                  </thead>

                  <tbody>
                    {readings.map((reading) => (
                      <tr key={reading.id}>
                        <td>{formatDate(reading.reading_date)}</td>
                        <td>{reading.reading_slot}</td>
                        <td>
                          <strong>{reading.glucose_level}</strong>
                          <span> mg/dL</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="reports-history-empty">
                No readings found for this period.
              </div>
            )}
          </section>

          <p className="reports-disclaimer">
            Sweety provides tracking and informational analytics only.
            It does not diagnose medical conditions or replace
            professional medical advice.
          </p>
        </>
      )}
    </main>
  );
}

export default Reports;
