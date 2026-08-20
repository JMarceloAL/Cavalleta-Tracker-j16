package expo.modules.smsnative

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.provider.Telephony
import android.telephony.SmsManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSmsNativeModule : Module() {
    private var receiver: BroadcastReceiver? = null

    override fun definition() = ModuleDefinition {
        Name("ExpoSmsNative")

        Events("onSmsReceived")

        AsyncFunction("sendSms") { phoneNumber: String, message: String ->
            val smsManager = SmsManager.getDefault()
            val parts = smsManager.divideMessage(message)

            if (parts.size > 1) {
                smsManager.sendMultipartTextMessage(phoneNumber, null, parts, null, null)
            } else {
                smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            }

            true
        }

        Function("startListening") {
            startListening()
        }

        Function("stopListening") {
            stopListening()
        }

        OnDestroy {
            stopListening()
        }
    }

    private fun startListening() {
        if (receiver != null) return

        val context = appContext.reactContext ?: return

        receiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context?, intent: Intent?) {
                if (intent?.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

                val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
                if (messages.isNullOrEmpty()) return

                val originatingAddress = messages[0].originatingAddress ?: ""
                val body = messages.joinToString(separator = "") { it.messageBody ?: "" }

                sendEvent(
                    "onSmsReceived",
                    mapOf(
                        "originatingAddress" to originatingAddress,
                        "body" to body,
                        "timestamp" to System.currentTimeMillis()
                    )
                )
            }
        }

        context.registerReceiver(receiver, IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION))
    }

    private fun stopListening() {
        val context = appContext.reactContext ?: return

        receiver?.let {
            try {
                context.unregisterReceiver(it)
            } catch (e: Exception) {
                // já estava desregistrado
            }
        }
        receiver = null
    }
}