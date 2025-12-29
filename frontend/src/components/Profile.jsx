import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";

export function Profile() {
	const navigate = useNavigate();
	const { user: authUser, logout, loading: authLoading } = useAuth();
	const [formData, setFormData] = useState({
		full_name: "",
		phone: "",
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const data = await userService.getProfile();
				setFormData({
					full_name: data.full_name || "",
					phone: data.phone || "",
				});
			} catch (err) {
				console.error("Failed to load profile:", err);
				setError(err.response?.data?.error || "Failed to load profile");
			} finally {
				setLoading(false);
			}
		};

		if (!authLoading) {
			fetchProfile();
		}
	}, [authLoading]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setUpdating(true);
		setError("");

		try {
			await userService.updateProfile(formData);
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			console.error("Failed to update profile:", err);
			setError(err.response?.data?.error || "Failed to update profile");
		} finally {
			setUpdating(false);
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/", { replace: true });
	};

	if (authLoading || loading) {
		return (
			<div className="card" style={{ textAlign: "center" }}>
				<div className="spinner"></div>
				<p style={{ marginTop: "1rem" }}>Loading profile...</p>
			</div>
		);
	}

	return (
		<div className="card">
			{error && (
				<div className="alert alert-error">
					<span>⚠️ {error}</span>
				</div>
			)}
			{success && (
				<div className="alert alert-success">
					<span>✓ Profile updated successfully!</span>
				</div>
			)}

			{authUser && (
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>📧 Email Address</label>
						<input
							type="email"
							value={authUser.email}
							disabled
							style={{
								backgroundColor: "#f5f5f5",
								cursor: "not-allowed",
							}}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="full_name">👤 Full Name</label>
						<input
							type="text"
							id="full_name"
							name="full_name"
							value={formData.full_name}
							onChange={handleChange}
							disabled={updating}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="phone">📱 Phone Number</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							disabled={updating}
							placeholder="+1 (555) 000-0000"
						/>
					</div>

					<div className="form-group">
						<label>🆔 Account Status</label>
						<input
							type="text"
							value={authUser.kyc_status || "Pending"}
							disabled
							style={{
								backgroundColor: "#f5f5f5",
								cursor: "not-allowed",
							}}
						/>
						<small
							style={{ display: "block", marginTop: "0.5rem", color: "#999" }}
						>
							KYC status determines your account verification level
						</small>
					</div>

					<div className="form-group">
						<label>📅 Member Since</label>
						<input
							type="text"
							value={
								new Date(authUser.created_at).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								}) || "Unknown"
							}
							disabled
							style={{
								backgroundColor: "#f5f5f5",
								cursor: "not-allowed",
							}}
						/>
					</div>

					<div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={updating}
						>
							{updating ? "Saving..." : "💾 Save Changes"}
						</button>
						<button
							type="button"
							onClick={handleLogout}
							className="btn btn-danger"
						>
							🚪 Logout
						</button>
					</div>
				</form>
			)}
		</div>
	);
}
