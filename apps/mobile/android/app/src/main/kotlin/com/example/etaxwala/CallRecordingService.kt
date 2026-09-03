package com.example.etaxwala

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.media.MediaRecorder
import android.util.Log
import java.io.File

class CallRecordingService : AccessibilityService() {
    private var recorder: MediaRecorder? = null
    private var isRecording = false
    private lateinit var outputFilePath: String

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        when (event?.eventType) {
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                if (event.text.toString().contains("End Call")) {
                    stopRecording()
                }
            }
        }
    }

    override fun onInterrupt() {
        Log.d("CallRecordingService", "Service Interrupted")
    }

    fun startRecording() {
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
            Log.d("CallRecordingService", "Recording started at: $outputFilePath")
        } catch (e: Exception) {
            Log.e("CallRecordingService", "Error starting recording: ${e.message}")
        }
    }

    fun stopRecording() {
        if (isRecording) {
            try {
                recorder?.stop()
                recorder?.release()
                recorder = null
                isRecording = false
                Log.d("CallRecordingService", "Recording stopped, file saved at: $outputFilePath")
            } catch (e: Exception) {
                Log.e("CallRecordingService", "Error stopping recording: ${e.message}")
            }
        }
    }
}
