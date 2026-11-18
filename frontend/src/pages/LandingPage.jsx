import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function LandingPage() {
    const [status, setStatus] = useState("Checking API...");

    useEffect(() => {
        api
            .get("/health")
            .then((res) => setStatus(res.data.message))
            .catch(() => setStatus("API not reachable"));
    }, []);

    return (
        <div className="flex gap-3">
            <Link to="/login" className="font-semibold text-primary">Log in</Link>
            <Link to="/register" className="font-semibold text-primary">Register</Link>
        </div>
    );
}