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
  asis:boolean=false


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
    console.log('entra');

  }

  ngOnDestroy() {
    this.stopScan();
  }

  ngAfterViewInit() {

    this.startScan(); 
    console.log('entra y escanea');
  }

  async startScan() {
    this.loadingService.show(50);
    try {
      this.scannedData = '';
      this.asignatura = '';
      this.seccion = '';
      this.sala = '';
      this.fecha = '';
      this.scannedCompleted = false;
  
      this.stopScan();
  
      if (!this.video || !this.video.nativeElement) {
        throw new Error('Elemento video no está disponible');
      }
  
      this.scanning = true;
  
      await this.codeReader.decodeFromVideoDevice(
        undefined,
        this.video.nativeElement,
        async (result: any, err: any) => {
          try {
            if (result && this.scanning) {
              this.scannedData = result.getText();
              this.scanning = false;
  
              await this.finalizeScan();
            } else if (err && !(err instanceof Error)) {
              console.error('Error en decodeFromVideoDevice:', err);
            }
          } catch (error) {
            console.error('Error durante el procesamiento del escaneo:', error);
          } finally {
            this.loadingService.hide();
          }
        }
      );
    } catch (error: any) {
      console.error('Error en el escaneo:', error);
      this.showAlert('Error', error.message || 'No se pudo iniciar el escaneo');
    } finally {
      this.loadingService.hide();
    }
  }
  
  async finalizeScan() {
    this.loadingService.show(100); 
    try {
      await this.handleScanCompletion();
    } catch (error) {
      console.error('Error al completar el escaneo:', error);
      this.showAlert('Error', 'Hubo un problema al procesar el escaneo.');
    } finally {
      this.loadingService.hide(); 
    }
  }
  
  async handleScanCompletion() {
    console.log('loading resultado');
    this.loadingService.show(100);
    try {
      await this.processScannedData(this.scannedData);
      console.log('ses',localStorage);
      const asistencia = {
        asignatura: this.asignatura,
        fecha: this.fecha.trim().replace('\n', ''),
        sala: this.sala,
        seccion: this.seccion,
        userId: localStorage.getItem('userId')
        
      };
      console.log('Asistencia:', asistencia);

      const exists = await this.firebaseService.verificarAsistencia(asistencia);
      console.log('¿La asistencia existe?:', exists);
      
      if (exists) {
        this.asis=true
        this.showAlert(
          'Asistencia ya registrada',
          'Ya has registrado tu asistencia con este código.'
        );
        return;
      }else{
        await this.checkLocation();
        if (!this.currentSede) {
          this.showAlert(
            'No estás en el DUOC',
            'No estás dentro de ninguna sede DUOC UC. No se guardará la asistencia.'
          );
          return;
        }
      }    
  
      await this.guardarAsistencia(asistencia);
      console.log('Asistencia guardada correctamente:', asistencia);
  
      this.showAlert('Escaneado correctamente', `Resultado: ${this.scannedData}`);
    } catch (error) {
      console.error('Error al completar el escaneo:', error);
      this.showAlert('Error', 'Hubo un problema al procesar el escaneo.');
    } finally {
      this.loadingService.hide(); 
      this.scanningSpace=false; 
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
  
    this.cdr.detectChanges();
  }
  

  async checkLocation() {
    try {
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log(`Latitud: ${lat}, Longitud: ${lng}`);

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
  
      asistencia.userId = usuario['id']; // Agregar userId antes de guardar
  
      await this.firebaseService.guardarAsistencia(asistencia);
      this.msgToast('Asistencia guardada exitosamente', 'success');
      console.log('Asistencia guardada en Firebase:', asistencia);
    } catch (error) {
      console.error('Error al guardar la asistencia:', error);
      this.showAlert('Error', 'Hubo un problema al guardar la asistencia.');
    }
  }
  
}
