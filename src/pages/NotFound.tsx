import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="min-h-screen flex flex-col items-center justify-center p-8">
    <h1 className="text-5xl font-bold mb-4">404</h1>
    <p className="text-xl mb-6">Sorry, the page you are looking for does not exist.</p>
    <Link to="/" className="text-primary underline">Go back home</Link>
  </main>
);

export default NotFound; 