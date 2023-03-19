import { db } from "./firebase.js";
import { collection, doc, addDoc, setDoc, getDoc, getDocs, query, limit, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js"

export const get_campaigns = async function(){
    let campanas = [];
    try {
        const listado = await getDocs(collection(db,"campañas"));
        listado.forEach(campana => {
            campanas.push({nombre:campana.id, descripcion:(campana.data().descripcion?campana.data().descripcion:'')})
        });
        return campanas;
    } catch (error) {
        throw new Error(error);
    }
}

export const get_log = async function(number_of_lines){
    try {
        const q = query(collection(db,"log"), orderBy("timestamp", "desc"), limit(number_of_lines));
        const campanas = await getDocs(q);
        const listado = [];
        campanas.forEach(campana => {
            listado.push([
                campana.data().timestamp.toDate().toISOString(),
                campana.data().fecha,
                campana.data().nombre,
                campana.data().url,
                campana.data().utm_source,
                campana.data().utm_medium,
                campana.data().utm_campaign,
                campana.data().utm_content || '',
                campana.data().utm_term || '',
                campana.data().sf_reyg_source || '',
                campana.data().user
            ])
        })
        return listado;
    } catch (error) {
        throw new Error(error);
    }
}

export const put_log = async function(data){
    try {
        data.timestamp = serverTimestamp();
        await addDoc(collection(db,"log"),data);

        let doc_campana = doc(db,"campañas",data.nombre);
        let refDoc = await getDoc(doc_campana);
        let datos;
        if (refDoc.exists()){
            datos = {
                descripcion: data.descripcion,
                lastUsed: data.timestamp,
                lastUsedBy: data.user,
            };
        }
        else {
            datos = {
                descripcion: data.descripcion,
                created: data.timestamp,
                createdBy: data.user
            }
        }
        await setDoc(doc_campana, datos, { merge: true });
    } catch (error) {
        throw new Error(error);
    }
}