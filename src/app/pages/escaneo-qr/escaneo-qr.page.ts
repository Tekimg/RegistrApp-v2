import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { AlertController } from '@ionic/angular';
import { LoadingService } from 'src/app/loading.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ToastController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from 'src/app/location-service.service';

@Component({
  selector: 'app-escaneo-qr',
  templateUrl: './escaneo-qr.page.html',
  styleUrls: ['./escaneo-qr.page.scss'],
})
export class EscaneoQrPage implements OnDestroy, AfterViewInit {
  currentSede: string | null = null;
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;

  // Variables del qr
  scannedData: string = '';
  asignatura: string = ''; 
  seccion: string = ''; 
  sala: string = ''; 
  fecha: string = ''; 
  scannedCompleted: boolean = false;


  private codeReader: BrowserMultiFormatReader;
  scanning: boolean = false;
  scanningSpace: boolean = true;

  constructor(
    private alertController: AlertController,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private firebaseService: FirebaseService,
    private toast: ToastController,
    private geolocation: Geolocation,
    private locationService: LocationService,
  ) {
    this.codeReader = new BrowserMultiFormatReader();
  }

  ngOnDestroy(): void {
    this.stopScan();
  }

  ngAfterViewInit() {
    this.startScan(); // Iniciar escaneo automáticamente al entrar en la página
    console.log('entra y escanea');
  }

  // Función para iniciar el escaneo
  async startScan() {
    this.loadingService.show(); // Muestra el mensaje de loading
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula un proceso largo

    // Limpiar todos los datos antes de comenzar un nuevo escaneo
    this.scannedData = ''; // Reiniciar el dato escaneado
    this.asignatura = '';
    this.seccion = '';
    this.sala = '';
    this.fecha = '';

    this.stopScan(); // Detener cualquier escaneo previo

    console.log('Valor de video:', this.video);

    if (!this.video) {
      console.error('Elemento video no está disponible');
      this.loadingService.hide(); // Ocultar el loading en caso de error con el video
      return;
    }

    this.scanning = true;
    this.codeReader
      .decodeFromVideoDevice(undefined, this.video.nativeElement, async (result: any, err: any) => {
        if (result && this.scanning) {
          this.scanningSpace = false;
          this.scannedData = result.getText();
          this.scanning = false;

          // Primero verificamos si el usuario está dentro de la sede
          await this.checkLocation();
          this.scannedCompleted = true;

          if (!this.currentSede) {
            // Si no está dentro de la sede, mostrar el mensaje y no procesar el escaneo
            this.showAlert('No estás en el DUOC', 'No estás dentro de ninguna sede DUOC UC. No se guardará la asistencia.');
          } else {
            // Si está dentro de la sede, mostrar el mensaje de éxito con los datos escaneados
            this.showAlert('Escaneado correctamente', `Resultado: ${this.scannedData}`);
            this.processScannedData(this.scannedData); // Procesar los datos del QR
          }

          // Detener el escaneo después de procesar los datos
          this.stopScan();
        }
        if (err && !(err instanceof Error)) {
          console.error(err);
        }
      })
      .catch((error: any) => {
        console.error('Error en el escaneo: ', error);
        this.showAlert('Error', 'No se pudo iniciar el escaneo');
      })
      .finally(() => {
        this.loadingService.hide(); // Ocultar el loading cuando termine el escaneo o haya error
      });
  }

  // Función para verificar si el usuario está dentro de la sede
  async checkLocation() {
    try {
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log(`Latitud: ${lat}, Longitud: ${lng}`);

      // Verifica si el usuario está dentro de una sede con la tolerancia de 100 metros
      const insideSede = await this.locationService.isInsideSede(lat, lng);

      if (insideSede) {
        console.log(`Estás dentro de la sede: ${insideSede}`);
        this.currentSede = insideSede;
      } else {
        console.log('No estás dentro de ninguna sede DUOC UC.');
        this.currentSede = null;
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      this.showAlert('Error', 'No se pudo obtener tu ubicación');
    }
  }

  // Procesa los datos escaneados
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

    this.asignatura = parts[0];
    this.seccion = parts[1];
    this.sala = parts[2];
    this.fecha = parts[3];

    console.log('Asignatura:', this.asignatura);
    console.log('Sección:', this.seccion);
    console.log('Sala:', this.sala);
    console.log('Fecha:', this.fecha);

    this.cdr.detectChanges(); // Detectar cambios

    // Si está dentro de la sede, se guarda la asistencia
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
  }

  // Detiene el escaneo
  stopScan() {
    this.scanning = false;
    const videoElement = this.video.nativeElement;
    const stream = videoElement.srcObject as MediaStream;

    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop()); // Detener la cámara
    }

    videoElement.srcObject = null;
  }

  // Muestra una alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Muestra un toast
  async msgToast(message: string, status: string) {
    const toast = await this.toast.create({
      message: message,
      color: status,
      duration: 2000
    });
    toast.present();
  }

  // Guarda la asistencia
  async guardarAsistencia(asistencia: any) {
    try {
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
      this.msgToast('Asistencia guardada exitosamente', 'success');
      console.log('Asistencia guardada en Firebase:', asistencia);
    } catch (error) {
      console.error('Error al guardar la asistencia:', error);
      this.showAlert('Error', 'Hubo un problema al guardar la asistencia.');
    }
  }
}
