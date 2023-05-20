import { Inter } from "next/font/google";
import PixiComponent from "@/components/PixiComponent";
import Head from "next/head";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  return (
    <>
      <Head></Head>
      <PixiComponent />
    </>
  );
};

export default Home;
