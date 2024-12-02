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
    console.log('alo');
    
  }

  ngOnDestroy() {
    this.stopScan();
  }

  ngAfterViewInit() {
    
    this.startScan(); // Iniciar escaneo automáticamente al entrar en la página
    console.log('entra y escanea');
  }

  async startScan() {
    this.loadingService.show(); // Muestra un indicador de carga
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula un proceso largo
  
    this.scannedData = ''; 
    this.asignatura = '';
    this.seccion = '';
    this.sala = '';
    this.fecha = '';
  
    this.stopScan(); 
  
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
  
          await this.handleScanCompletion();
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
        this.loadingService.hide(); 
      });
  }
  
  async handleScanCompletion() {
    try {
      // Verifica la ubicación
      await this.checkLocation();
  
      // Si no estás en una sede, muestra un mensaje
      if (!this.currentSede) {
        this.showAlert(
          'No estás en el DUOC',
          'No estás dentro de ninguna sede DUOC UC. No se guardará la asistencia.'
        );
        return;
      }
  
      // Procesa los datos escaneados
      await this.processScannedData(this.scannedData);
  
      // Muestra un mensaje de éxito
      this.showAlert('Escaneado correctamente', `Resultado: ${this.scannedData}`);
    } catch (error) {
      console.error('Error al completar el escaneo:', error);
      this.showAlert('Error', 'Hubo un problema al procesar el escaneo.');
    }
  }
  

  //verificar si el usuario está dentro de la sede
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
      //guardar la asistencia
      await this.guardarAsistencia(asistencia);
      console.log('Asistencia guardada correctamente:', asistencia);
    } catch (error) {
      console.error('Error al guardar la asistencia:', error);
      this.showAlert('Error', 'Hubo un problema al guardar la asistencia.');
    }
  }

  
  stopScan() {
    try {
      this.scanning = false;
  
      if (this.video && this.video.nativeElement) {
        const videoElement = this.video.nativeElement;
        const stream = videoElement.srcObject as MediaStream;
  
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop()); 
        }
  
        videoElement.srcObject = null;
      }
  
    } catch (error) {
      console.error('Error al detener el escaneo:', error);
    }
  }
  

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async msgToast(message: string, status: string) {
    const toast = await this.toast.create({
      message: message,
      color: status,
      duration: 2000
    });
    toast.present();
  }

  async guardarAsistencia(asistencia: any) {
    try {
      if (!asistencia.asignatura || !asistencia.seccion || !asistencia.sala || !asistencia.fecha) {
        console.error('Datos incompletos para guardar la asistencia');
        return;
      }

      const usuario = await this.firebaseService.obtenerUsuarioAutenticado();
      if (!usuario) {
        console.error('No se encontró un usuario autenticado.');
        return;
      }

      asistencia.userId = usuario['id'];

      await this.firebaseService.guardarAsistencia(asistencia);

      this.msgToast('Asistencia guardada exitosamente', 'success');
      console.log('Asistencia guardada en Firebase:', asistencia);
    } catch (error) {
      console.error('Error al guardar la asistencia:', error);
      this.showAlert('Error', 'Hubo un problema al guardar la asistencia.');
    }
  }
}
