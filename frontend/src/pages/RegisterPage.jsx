import React from "react";
import { Header, Footer } from "../components/Layout";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
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
				<RegisterForm />
			</div>
			<Footer />
		</>
	);
}
