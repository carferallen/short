import { db } from "./firebase.js";
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js"
import { Autocomplete } from "./autocomplete.js";

export const put_campaign = async function(data){
    try {
        data.timestamp = serverTimestamp();
        await addDoc(collection(db,"campaigns"),data);
    } catch (error) {
        throw new Error(error);
    }
}

export const get_campaigns = async function(){
    let campanas = [];
    try {
        const listado = await getDocs(collection(db,"campaigns"));
        listado.forEach(campana => {
            let nuevo = campana.data();
            let obj = campanas.find(o => o.label === nuevo.nombre);
            if (!obj){
                campanas.push({label:nuevo.nombre, value:' ('+nuevo.descripcion+')'})
            }
        });
        const ac = new Autocomplete(document.getElementById('nombre'), {
            data: campanas,
            showValue: true,
            onSelectItem: ({label, value}) => {
                $('#nombre_descriptivo').val(value.replace(' (','').replace(')',''));
            }
        });
    } catch (error) {
        throw new Error(error);
    }
}

export const get_campaigns_details = async function(){
    try {
        const q = query(collection(db,"campaigns"), orderBy("timestamp", "desc"));
        const listado = await getDocs(q);
        return listado;
    } catch (error) {
        throw new Error(error);
    }
}