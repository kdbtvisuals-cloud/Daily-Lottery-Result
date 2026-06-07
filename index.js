import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, query, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyA5Z8Q2Gd5HnJ8bw0VLD1pXLj9p0Y19IYA",
    authDomain: "daily-lottery-results-e654b.firebaseapp.com",
    projectId: "daily-lottery-results-e654b",
    storageBucket: "daily-lottery-results-e654b.firebasestorage.app",
    messagingSenderId: "590578491665",
    appId: "1:590578491665:web:fff837004eb1fd92ca6cb0",
    measurementId: "G-X6SQC2YL3G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;
window.collection = collection;
window.addDoc = addDoc;

async function getdata() {
    const table = document.getElementById("resultsTable");
    const totalResult = document.getElementById("totalResult");
    const todayResult = document.getElementById("todayResult");
    const lastUpdate = document.getElementById("lastUpdate");

    try {
        const q = query(collection(db, "lotteryResults"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const data = [];

        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        })

        console.log(data);

        if (data.length > 0) {
            totalResult.innerText = data.length;
            todayResult.innerText = data[0].number;
            const newDate = new Date(data[0].date);
            const formattedDate = newDate.toLocaleString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            })
            lastUpdate.innerText = formattedDate;
        } else {
            totalResult.innerHTML = "No Data"
            todayResult.innerHTML = "No Data"
        }

        table.innerHTML = "";
        if (data.length === 0) {
            table.innerHTML = `<tr><td colspan="3">No Data Availble</td></tr>`
            return;
        }
        data.forEach(item => {
            table.innerHTML += `
                        <tr>
                            <td>${item.date.split("T")[0]}</td>
                            <td>${item.name}</td>
                            <td class="win">${item.number}</td>
                    `
        })
    } catch (error) {
        console.error("Firestore Error: " + error)
    }
}

function _onload() {
    let isLogIn = localStorage.getItem("islogIn");
    console.log("Credentials: " + isLogIn)
    if (isLogIn == "false") {
        window.location.href = 'login.html';
    }
}

window.onload = function () {
    _onload()
    getdata()
    console.log("Run Afrer Refresh")

};

window.logout = function () {
    let isLogIn = false;
    localStorage.setItem("islogIn", isLogIn)
    window.location.href = 'login.html'
}

window.navPublic = function () {
    window.location.href = "index.html"
}

window.submit = async function submit() {

    const name = document.getElementById("name");
    const lottery_name = document.getElementById("lottery_name")

    const errormsg_name = document.getElementById("errormsg_name");
    const errormsg_lottery_name = document.getElementById("errormsg_lottry_name");

    let isvalid = true;

    errormsg_name.innerText = "";
    errormsg_lottery_name.innerText = "";


    if (name.value.length === 0) {
        errormsg_name.innerText = "Please Enter the Name";
        isvalid = false;
    }

    if (lottery_name.value.length === 0) {
        errormsg_lottery_name.innerText = "Please Enter the lottery_name";
        isvalid = false;
    }

    if (isvalid) {
        const result = await Swal.fire({
            title: "Confirm Save",
            html: `
        <b>Lottery Name:</b> ${name.value}<br>
        <b>Lottery Number:</b> ${lottery_name.value}
    `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Save",
            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) {
            return;
        }
        const data = {
            "name": name.value,
            "number": lottery_name.value,
            "date": new Date().toISOString()
        }

        try {
            await addDoc(
                collection(db, "lotteryResults"),
                data
            );
            console.log("data Saved in firstore")
        } catch (error) {
            console.log(error);
        }

        // let allData = JSON.parse(localStorage.getItem("data")) || [];

        // allData.push(data);

        // localStorage.setItem("data", JSON.stringify(allData))
        // console.log("Saved: "+localStorage.getItem("data"))
        alert("Saved successfully")



        name.value = "";
        lottery_name.value = "";
        getdata();
    }




}

document.getElementById("addResult").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Yahoo")
    await submit();
})
