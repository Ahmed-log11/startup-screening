import { Route, Routes } from "react-router";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import FounderForm from "./pages/FounderForm";
import FounderResult from "./pages/FounderResult";
import Investor from "./pages/Investor";
import CompanyDetail from "./pages/CompanyDetail";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/founder" element={<FounderForm />} />
        <Route path="/founder/result" element={<FounderResult />} />
        <Route path="/investor" element={<Investor />} />
        <Route path="/investor/:id" element={<CompanyDetail />} />
      </Routes>
    </div>
  );
}
