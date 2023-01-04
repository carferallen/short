import { db } from "./firebase.js";
import { collection, doc, addDoc, setDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js"
import { ac } from "./init.js";

export const get_campaigns = async function(){
    let campanas = [];
    try {
        const listado = await getDocs(collection(db,"campañas"));
        listado.forEach(campana => {
            campanas.push({label:campana.id, value:(campana.data().descripcion?' ('+campana.data().descripcion+')':'')})
        });
        ac.setData(campanas);
    } catch (error) {
        throw new Error(error);
    }
}

export const get_log = async function(){
    try {
        const q = query(collection(db,"log"), orderBy("timestamp", "desc"));
        const listado = await getDocs(q);
        return listado;
    } catch (error) {
        throw new Error(error);
    }
}

export const put_log = async function(data){
    try {
        data.timestamp = serverTimestamp();
        await addDoc(collection(db,"log"),data);
        await setDoc(doc(db,"campañas",data.nombre),{
            descripcion:data.descripcion,
            lastUsed: data.timestamp,
            lastUsedBy: data.user,
        });
    } catch (error) {
        throw new Error(error);
    }
}