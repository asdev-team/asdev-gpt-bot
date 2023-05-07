import { BotController } from './BotController.js'
import config from 'config'
import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'

const bot = new Telegraf( config.get( 'TELEGRAM_TOKEN' ) )

bot.use(session())

bot.command('start', async (ctx)=>{
	await BotController.init(ctx)
})
bot.command('new', async (ctx)=>{
	await BotController.init(ctx)
})

bot.on( message( 'voice' ), async ( ctx ) => {
	await BotController.onVoice( ctx )
} )

bot.on( message( 'text' ), async ( ctx ) => {
	console.log( ctx.session )
	await BotController.onText( ctx )
} )

// bot.command( 'start', async ( ctx ) => {
// 	await ctx.reply( JSON.stringify( ctx.message, null, 2 ) )
// } )

bot.launch()

process.once( 'SIGINT', () => bot.stop( 'SIGINT' ) )
process.once( 'SIGTERM', () => bot.stop( 'SIGTERM' ) )