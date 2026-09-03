package com.example.etaxwala

import android.Manifest
import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.os.Build
import android.os.Bundle
import android.telephony.PhoneStateListener
import android.telephony.TelephonyManager
import android.content.Context
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import io.flutter.embedding.android.FlutterActivity
import java.io.File

class MainActivity : FlutterActivity() {
    private var recorder: MediaRecorder? = null
    private var isRecording = false
    private lateinit var telephonyManager: TelephonyManager
    private lateinit var outputFilePath: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPermissions() // Request permissions at runtime
    }

    override fun onStart() {
        super.onStart()

        telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE)
            == PackageManager.PERMISSION_GRANTED
        ) {
            telephonyManager.listen(object : PhoneStateListener() {
                override fun onCallStateChanged(state: Int, phoneNumber: String?) {
                    when (state) {
                        TelephonyManager.CALL_STATE_OFFHOOK -> startRecording()
                        TelephonyManager.CALL_STATE_IDLE -> stopRecording()
                    }
                }
            }, PhoneStateListener.LISTEN_CALL_STATE)
        }
    }

    private fun startRecording() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) { // Android 9 and Below
            try {
                outputFilePath = "${externalCacheDir?.absolutePath}/call_record_${System.currentTimeMillis()}.3gp"
                recorder = MediaRecorder().apply {
                    setAudioSource(MediaRecorder.AudioSource.VOICE_COMMUNICATION)
                    setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP)
                    setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB)
                    setOutputFile(outputFilePath)
                    prepare()
                    start()
                }
                isRecording = true
                Log.d("CallRecorder", "Recording started at: $outputFilePath")
            } catch (e: Exception) {
                Log.e("CallRecorder", "Error starting recording: ${e.message}")
            }
        } else {
            Log.d("CallRecorder", "Android 10+ detected, using Accessibility Service instead.")
            // For Android 10+, call recording is handled in CallRecordingService.kt
        }
    }

    private fun stopRecording() {
        if (isRecording) {
            try {
                recorder?.stop()
                recorder?.release()
                recorder = null
                isRecording = false
                Log.d("CallRecorder", "Recording stopped, file saved at: $outputFilePath")
            } catch (e: Exception) {
                Log.e("CallRecorder", "Error stopping recording: ${e.message}")
            }
        }
    }

    private fun requestPermissions() {
        val permissions = arrayOf(
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        )

        ActivityCompat.requestPermissions(this, permissions, 1)
    }
}
