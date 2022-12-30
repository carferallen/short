import { db } from "./firebase.js";
import { collection, addDoc, setDoc, doc, getDocs, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js"
import { Autocomplete } from "./autocomplete.js";

export const put_campaign = async function(data, email){
    try {
        data.timestamp = serverTimestamp();
        await addDoc(collection(db,"campaigns"),data);
        await setDoc(doc(db, "users", data.userid), {email: email});
    } catch (error) {
        throw new Error(error);
    }
}

export const get_campaigns = async function(){
    let campanas = [];
    try {
        const listado = await getDocs(collection(db,"campaigns"), orderBy("nombre"));
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