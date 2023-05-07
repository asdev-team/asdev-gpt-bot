import installer from '@ffmpeg-installer/ffmpeg'
import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import { createReadStream, createWriteStream } from 'fs'
import { unlink } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { formatResolve } from './utils.js'

class FileControllerClass {
	constructor() {
		this.__dirname = dirname( fileURLToPath( import.meta.url ) )
		ffmpeg.setFfmpegPath( installer.path )
	}
	
	getTempPathWithFile( filename, ext ) {
		return resolve( this.__dirname, '../temp', `${ filename }.${ ext }` )
	}
	
	async removeFile( filePath ) {
		return new Promise( async ( resolve, reject ) => {
			try {
				await unlink( filePath )
				resolve( true )
			}
			catch ( e ) {
				reject( false )
				console.log( 'Error while remove file', e.message )
			}
		} )
	}
	
	async toMP3( input, filename ) {
		return new Promise( ( resolve ) => {
			const mp3Path = this.getTempPathWithFile( filename, 'mp3' )
			ffmpeg( input )
				.inputOptions( '-t 30' )
				.output( mp3Path )
				.on( 'end', () => resolve( formatResolve( {
					status: true,
					data: mp3Path
				} ) ) )
				.on( 'error', e => resolve( formatResolve( {
					status: false,
					errorMessageResponse: `Ошибка конвертации файла: ${ e.message }`,
					errorMessage: 'Ошибка конвертации файла. Повтори еще раз.'
				} ) ) )
				.run()
		} )
	}
	
	async download( url, filename ) {
		return new Promise( resolve => {
			const filePathOGG = this.getTempPathWithFile( filename, 'ogg' )
			axios( {
				method: 'get',
				url,
				responseType: 'stream'
			} )
				.then( response => {
					const stream = createWriteStream( filePathOGG )
					response.data.pipe( stream )
					stream.on( 'finish', () => resolve( formatResolve( {
						status: true,
						data: filePathOGG
					} ) ) )
				} )
				.catch( e => resolve( formatResolve( {
					status: false,
					errorMessageResponse: `Ошибка скачивания файла: ${ e.message }`,
					errorMessage: 'Ошибка в получении файла. Повтори еще раз.'
				} ) ) )
		} )
	}
	
	async getFileStream( filePath ) {
		return new Promise( async ( resolve ) => {
			const stream = createReadStream( filePath )
			stream
				.on( 'error', e => resolve( formatResolve( {
					status: false,
					errorMessageResponse: `Ошибка в открытии потока файла: ${ e.message }`,
					errorMessage: 'Ошибка в открытии потока файла. Повтори еще раз.'
				} ) ) )
				.on( 'open', () => resolve( formatResolve( {
					status: true,
					data: stream
				} ) ) )
			
		} )
	}
}

export const FileController = new FileControllerClass()