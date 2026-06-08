import React from 'react';
// यहाँ सिर्फ वही इम्पोर्ट्स रखें जो डैशबोर्ड के लिए जरूरी हैं
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="p-10">
        <h1 className="text-4xl font-bold">Welcome to Admin Dashboard</h1>
        {/* यहाँ आपके डैशबोर्ड का मुख्य कंटेंट आएगा */}
      </main>
      <Footer />
    </div>
  );
}