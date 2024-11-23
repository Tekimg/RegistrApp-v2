import { Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, setDoc, updateDoc, getDoc, DocumentReference, DocumentData,
  query, where, getDocs, deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Auth, deleteUser } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: Firestore,
    private auth: Auth

  ) { }

  getCollectionChanges<tipo>(path: string) {
    const itemCollection = collection(this.firestore, path)
    return collectionData(itemCollection) as Observable<tipo[]>;
  }

  createDocumentID(data: any, enlace: string, idDoc: string) {
    const document = doc(this.firestore, `${enlace}/${idDoc}`);
    return setDoc(document, data)
  }

  async updateDocument(data: any, enlace: string, idDoc: string) {
    const document = doc(this.firestore, `${enlace}/${idDoc}`);
    return updateDoc(document, data)
  }
  createIdDoc() {
    return uuidv4();
  }
  async deleteDocAuth(path:string, id:string){
    const userData = doc(this.firestore, `${path}/${id}`);
    await deleteDoc(userData)
    const user= this.auth.currentUser;
    if (user) {
      try {
        await deleteUser(user);  // Elimina al usuario autenticado de Firebase Authentication
        console.log('Usuario eliminado de Firebase Auth');
      } catch (error) {
        console.error('Error al eliminar usuario de Firebase:', error);
      }
    }
  }

  async getDocumentByField(collectionName: string, field: string, value: string): Promise<DocumentData | null> {
    try {
      const ref = collection(this.firestore, collectionName); 
      const q = query(ref, where(field, '==', value)); 
      const querySnapshot = await getDocs(q);
      // Si no se encuentra ningún documento, retornar null
      if (querySnapshot.empty) {
        return null;
      }
      // Si hay documentos, retornar el primer documento encontrado
      return querySnapshot.docs[0].data();
      console.log()

    } catch (error) {
      console.error("Error buscando el documento: ", error);
      return null;
    }
  }


  
}


