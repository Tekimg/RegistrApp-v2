import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { AlertController } from '@ionic/angular';
import { LoadingService } from 'src/app/loading.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-escaneo-qr',
  templateUrl: './escaneo-qr.page.html',
  styleUrls: ['./escaneo-qr.page.scss'],
})
export class EscaneoQrPage implements OnDestroy, AfterViewInit {
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;

  // Variables del qr
  scannedData: string = '';
  asignatura: string = ''; // Nueva variable para almacenar la asignatura
  seccion: string = ''; // Nueva variable para almacenar la sección
  sala: string = ''; // Nueva variable para almacenar la sala
  fecha: string = ''; // Nueva variable para almacenar la fecha

  private codeReader: BrowserMultiFormatReader;
  scanning: boolean = false;
  scanningSpace: boolean = true;

  constructor(
    private alertController: AlertController,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private firebaseService:FirebaseService,
    private toast: ToastController
  ) { // Se agregó el loadingService
    this.codeReader = new BrowserMultiFormatReader();
  }

  ngAfterViewInit() {
    this.startScan(); // Hace que se inicie el escaneo apenas se ingresa a la página
    console.log('entra y escanea');
    this.scannedData = ("")
    console.log('limpia?');
    this.asignatura = 'PruebaAsignatura';
    this.seccion = 'PruebaSeccion';
    this.sala = 'PruebaSala';
    this.fecha = 'PruebaFecha';
    this.cdr.detectChanges(); // Forzar actualización de la vista
    //hernan
    this.cdr.detectChanges();
  }

  //guuardar asis
  async guardarAsistencia(asistencia: any) {
    try {
      // Verificar que todos los campos requeridos estén presentes
      if (!asistencia.asignatura || !asistencia.seccion || !asistencia.sala || !asistencia.fecha) {
        console.error('Datos incompletos para guardar la asistencia');
        return;
      }

      // Obtener el usuario autenticado
      const usuario = await this.firebaseService.obtenerUsuarioAutenticado();
      if (!usuario) {
        console.error('No se encontró un usuario autenticado.');
        return;
      }

      // Asignar el ID del usuario al objeto de asistencia
      asistencia.userId = usuario['id'];

      // Guardar la asistencia en Firebase
      await this.firebaseService.guardarAsistencia(asistencia);

      // Mostrar una alerta de éxito
      this.msgToast('Asistencia guardada exitosamente', 'succes')
      console.log('Asistencia guardada en Firebase:', asistencia);

    } catch (error) {
      console.error('Error al guardar la asistencia:', error);
      this.showAlert('Error', 'Hubo un problema al guardar la asistencia.');
    }
  }


  async startScan() {
    this.loadingService.show(); // Muestra el mensaje de loading
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula un proceso largo

    this.scannedData = ''; // Reiniciar el dato escaneado
    this.asignatura = '';
    this.seccion = '';
    this.sala = '';
    this.fecha = '';

    // Simulación de datos de prueba para verificar lógica
    // const testData = 'MDY4121|012D|L8|30102025';
    // this.processScannedData(testData);

    this.processScannedData(this.scannedData);
    // Acá va la lógica del escaneo v
    this.loadingService.hide(); // Oculta el mensaje de loading
    console.log('Valor de video:', this.video);


    if (!this.video) {
      console.error('Elemento video no está disponible');
      return;
    }
    this.scanning = true;
    this.codeReader
      .decodeFromVideoDevice(undefined, this.video.nativeElement, (result: any, err: any) => {
        if (result && this.scanning) {
          this.scanningSpace = false;
          this.scannedData = result.getText();
          this.scanning = false;
          this.showAlert('Escaneado correctamente', `Resultado: ${this.scannedData}`);
          this.stopScan();
          this.processScannedData(this.scannedData); // NI
          console.log("Resultado :)")

          // Divide el string en 4 variables
          const [asignatura, seccion, sala, fecha] = this.scannedData.split('|');
          console.log("Asignatura:", asignatura);
          console.log("Sección:", seccion);
          console.log("Sala:", sala);
          console.log("Fecha:", fecha);

          // Ahora se puede utilizar las variables de asignatura, sección, sala y fecha
          // FORMATO FECHA AÑO MES DIA <-------- TODO JUNTO

        }
        if (err && !(err instanceof Error)) {
          console.error(err);
        }
      })
      .catch((error: any) => {
        console.error('Error en el escaneo: ', error);
        this.showAlert('Error', 'No se pudo iniciar el escaneo');
      });
  }

  async processScannedData(data: string) {
    console.log('Datos escaneados (raw):', data);

    if (!data.includes('|')) {
      console.error('Formato inválido: no contiene el caracter "|"');
      return;
    }

    const parts = data.split('|');
    console.log('Partes separadas:', parts);

    if (parts.length !== 4) {
      console.error('Formato inválido: no contiene 4 partes');
      return;
    }

    if (parts.length === 4) {
      this.asignatura = parts[0];
      this.seccion = parts[1];
      this.sala = parts[2];
      this.fecha = parts[3];

      console.log('Asignatura:', this.asignatura);
      console.log('Sección:', this.seccion);
      console.log('Sala:', this.sala);
      console.log('Fecha:', this.fecha);

      this.cdr.detectChanges(); // Detectar cambios
      // Crear el objeto de asistencia
      const asistencia = {
        asignatura: this.asignatura,
        seccion: this.seccion,
        sala: this.sala,
        fecha: this.fecha
      };

      try {
        // Llamar a la función para guardar la asistencia
        await this.guardarAsistencia(asistencia);
        console.log('Asistencia guardada correctamente:', asistencia);
      } catch (error) {
        console.error('Error al guardar la asistencia:', error);
        this.showAlert('Error', 'Hubo un problema al guardar la asistencia.');
      }
    } else {
      console.error('Formato de datos escaneados incorrecto');
      // this.showAlert('Error', 'El formato del código QR es inválido.');
    }
  }

  stopScan() {
    this.scanning = false;
    const videoElement = this.video.nativeElement;
    const stream = videoElement.srcObject as MediaStream;

    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoElement.srcObject = null;
    }

  }

  ngOnDestroy() {
    this.scannedData = '';
    console.log("Detener scan, Borra algo?")
  }

  async msgToast(message: string, color: string) {
    const toast = await this.toast.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: color
    });

  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
