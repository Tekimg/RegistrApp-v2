import { Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, setDoc, updateDoc, getDoc, DocumentReference, DocumentData,
  query, where, getDocs, deleteDoc, addDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Auth, deleteUser, sendPasswordResetEmail } from '@angular/fire/auth';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: Firestore,
    private auth: Auth,
    private toastController: ToastController

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
        await deleteUser(user);  // Elimina al usuario autenticado de firebase
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
      if (querySnapshot.empty) {
        return null;
      }
      return querySnapshot.docs[0].data();
      console.log()

    } catch (error) {
      console.error("Error buscando el documento: ", error);
      return null;
    }
  }

  async obtenerUsuarioAutenticado() {
    const user = this.auth.currentUser; 
    console.log('user', user);
    
    if (!user) {
      console.error('No hay un usuario autenticado.');
      return null;
    }
  
    const email = user.email;
    if (!email) {
      console.error('El usuario autenticado no tiene un email.');
      return null;
    }
  
    const usuario = await this.getDocumentByField('Users', 'email', email);
    if (!usuario) {
      console.error('No se encontró un usuario con este email en la colección.');
      return null;
    }
  
    console.log('Usuario autenticado encontrado:', usuario);
    return usuario; 
  }
  
  
  async guardarAsistencia(data: any) {
    const asistenciasCollection = collection(this.firestore, 'Asistencias');
    return await addDoc(asistenciasCollection, data);
  }

  async obtenerAsistenciasPorUsuario(userId: string) {
    const asistenciasCollection = collection(this.firestore, 'Asistencias');
    const q = query(asistenciasCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data());
  }


async findUserByEmail(email: string): Promise<boolean> {
  try {
    const usersCollection = collection(this.firestore, 'Users');
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error buscando el correo en la colección Users:", error);
    return false;
  }
}

async sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(this.auth, email);
    this.showToast('Correo enviado para restablecer la contraseña', 'success');
  } catch (error) {
    console.error("Error al enviar el correo de restablecimiento:", error);
    this.showToast('Hubo un error al enviar el correo, intenta nuevamente', 'danger');
  }
}

async verificarAsistencia(asistencia: any): Promise<boolean> {
  console.log('Iniciando verificación de asistencia...');
  
  

    // Definir la colección
    const asistenciasCollection = collection(this.firestore, 'Asistencias');

    // Crear la consulta
    const q = query(
      asistenciasCollection,
      where('asignatura', '==', asistencia.asignatura),
      where('fecha', '==', asistencia.fecha), // Asegúrate de que el tipo de dato coincida
      where('sala', '==', asistencia.sala),
      where('seccion', '==', asistencia.seccion),
      where('userId', '==', asistencia.userId)
    );

    // Log para depuración
    console.log('Datos enviados a la consulta:', asistencia);

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);

    // Depurar los resultados
    if (querySnapshot.empty) {
      console.log('No se encontraron coincidencias para la asistencia.');
    } else {
      querySnapshot.forEach(doc => {
        console.log('Documento encontrado:', doc.data());
      });
    }

    // Retornar true si se encontró algún documento
    return !querySnapshot.empty;
  
  
}





async showToast(message: string, color: string): Promise<void> {
  const toast = await this.toastController.create({
    message: message,
    duration: 2500,
    position: 'bottom',
    color: color
  });
  toast.present();
}
}