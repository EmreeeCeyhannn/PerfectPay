import React from "react";
import { Header, Footer } from "../components/Layout";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
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
				<LoginForm />
			</div>
			<Footer />
		</>
	);
}
