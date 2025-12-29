import React from "react";
import { Header, Footer } from "../components/Layout";
import { Profile } from "../components/Profile";

export function ProfilePage() {
	return (
		<>
			<Header />
			<div
				className="container"
				style={{
					maxWidth: "600px",
					margin: "2rem auto",
					minHeight: "calc(100vh - 400px)",
				}}
			>
				<h1
					style={{
						fontSize: "2rem",
						marginBottom: "2rem",
						color: "#2c3e50",
						textAlign: "center",
					}}
				>
					👤 My Profile
				</h1>
				<Profile />
			</div>
			<Footer />
		</>
	);
}
