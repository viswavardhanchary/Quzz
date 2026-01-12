import { Outlet } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { useState } from "react"
export default function PageLayout() {
  return (
    <>
      <div className="bg-[#0B1020] w-full min-h-full mt-10">
          <Header />
          <Outlet />
          <Footer />
      </div>
    </>

  )
}