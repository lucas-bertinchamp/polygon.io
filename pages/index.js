import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import StartingMenu from "../components/startingMenu";

export default function Home() {
    return (
        <>
            <Head>
                <title>polygon.io</title>
                <meta
                    name="description"
                    content="For the Advanced Software Engineering class"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossorigin
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700;900&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <main>
                <StartingMenu />
            </main>
        </>
    );
}
