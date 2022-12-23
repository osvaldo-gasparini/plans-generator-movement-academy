import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { type } from "os";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    const sheetId: string = "1TW41_iMkvCvsqjedB7XLEUiP8uUGnAJp";
    const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
    const sheetName = "Plan";
    const query = encodeURIComponent("Select *");
    const url = `${base}&sheet=${sheetName}&tq=${query}`;
    const [message, setMessage] = useState<string>();
    const [videoData, setVideoData] = useState<any>();

    const getDataOfPlan = async () => {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(async (res) => {
                    if (res) {
                        const data: string = await res.text();
                        return data;
                    }
                    reject(
                        `No he podido recuperar los datos. Codigo de error: ${res.status}`
                    );
                })
                .then((rep) => {
                    resolve(rep);
                });
        });
    };

    /* Videos */
    const getDataOfVideos = async () => {
        const URL_VIDEOS =
            "https://docs.google.com/spreadsheets/d/1v2O32EqUEzuFbUzruf1xGoo2mNCrhsQXu7f_it7u_Gs/gviz/tq?";
        return new Promise((resolve, reject) => {
            fetch(URL_VIDEOS)
                .then(async (res) => {
                    if (res) {
                        const data: string = await res.text();
                        setVideoData(data);
                    }
                    reject(
                        `No he podido recuperar los datos. Codigo de error: ${res.status}`
                    );
                })
                .then((rep) => {
                    resolve(rep);
                });
        });
    };

    const processDataOfVideos = (excercice: string) => {
        if (videoData) {
            const data = videoData;
            const { table } = JSON.parse(data.substring(47).slice(0, -2));
            const minData = table.rows.slice(1);
            const videoFounded = minData.find((row: any) => {
                if (row.c[0].v === excercice) {
                    return true;
                }
            });
            return videoFounded ? videoFounded.c[1].v : false;
        } else {
            return false;
        }
    };

    const processData = async () => {
        const excercices: string[][] = [];
        let actualDay: string[] = [];

        const data = await getDataOfPlan();
        const { table } = JSON.parse(data.substring(47).slice(0, -2));
        const name = table.rows[1].c[4].v;
        const minData = table.rows.slice(8);
        minData.filter((x: any, index: number) => {
            const field = x.c[2]?.v;
            if (field.includes("Ejercicio")) {
                excercices.push(actualDay);
                actualDay = [];
            } else if (field !== "Registro") {
                actualDay.push(field);
                if (index === minData.length - 1) {
                    excercices.push(actualDay);
                }
            }
        });
        return {
            name,
            excercices,
        };
    };

    const generateMessage = async () => {
        let messageProcessed = "";
        const { excercices, name } = await processData();
        excercices.map(
            (dayComplete: string[], indexOfDay: number, rowOfDay) => {
                let partOfMessage = `Dia${indexOfDay + 1}: \n`;
                dayComplete.map(
                    (
                        excercice: string,
                        indexOfExercise: number,
                        rowOfExcercise
                    ) => {
                        const urlVideo: string | boolean =
                            processDataOfVideos(excercice);
                        const newText: string = `${excercice}: \n${urlVideo}`;
                        partOfMessage = partOfMessage.concat(
                            urlVideo
                                ? `${newText}\n`
                                : `${excercice}: \nNo hay video cargado actualmente\n`
                        );
                        if (
                            indexOfExercise + 1 === rowOfExcercise.length &&
                            indexOfDay !== rowOfDay.length
                        ) {
                            partOfMessage = partOfMessage.concat("\n");
                        }
                    }
                );
                messageProcessed = messageProcessed.concat(partOfMessage);
            }
        );
        console.log(messageProcessed);
    };

    useEffect(() => {
        getDataOfVideos();
    }, []);

    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <button
                    onClick={() => {
                        generateMessage();
                    }}
                >
                    GET DATA
                </button>
                {message ? <p>{message}</p> : null}
            </main>
        </>
    );
}
