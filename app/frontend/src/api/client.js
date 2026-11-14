// Every call to the backend lives here, so pages never build URLs themselves.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      /* keep the default message */
    }
    throw new Error(message);
  }
  return res.json();
}

const postJson = (path, data) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const api = {
  health: () => request("/health"),

  // Founder screen
  predict: (startup) => postJson("/predict", startup),
  insights: (startup, language = "en") => postJson("/insights", { ...startup, language }),

  // Investor screen
  companies: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined && v !== false)
    );
    return request(`/companies?${query}`);
  },
  filters: () => request("/companies/filters"),
  company: (id) => request(`/companies/${id}`),
  predictBatch: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/predict-batch", { method: "POST", body: form });
  },
  templateUrl: `${API_URL}/predict-batch/template`,
};
