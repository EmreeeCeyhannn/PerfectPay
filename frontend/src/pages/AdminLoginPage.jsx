import React from "react";
import { Header, Footer } from "../components/Layout";
import { AdminLoginForm } from "../components/AdminLoginForm";

export function AdminLoginPage() {
	return (
		<>
			<Header />
			<div
				className="container"
				style={{
					display: "flex",
					justifyContent: "center",
					minHeight: "80vh",
					alignItems: "center",
				}}
			>
				<AdminLoginForm />
			</div>
			<Footer />
		</>
	);
}
