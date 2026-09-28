import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:etaxwala/views/helper/shared_prefs_helper.dart';
import 'package:etaxwala/views/constant/domain.dart';

class FollowUpScreen extends StatefulWidget {
  final int leadId;
  final String leadName;
  final String domain;

  const FollowUpScreen({
    super.key,
    required this.leadId,
    required this.leadName,
    required this.domain,
  });

  @override
  State<FollowUpScreen> createState() => _FollowUpScreenState();
}

class _FollowUpScreenState extends State<FollowUpScreen> {
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  final _remarkController = TextEditingController();
  final _dateController = TextEditingController();
  final _timeController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String? _authToken;
  List<Map<String, String>> _followUpRemarks = [];
  String _lastRemark = '';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadAuthToken();
  }

  Future<void> _loadAuthToken() async {
    final token = await SharedPrefsHelper.getAuthToken();
    if (mounted) {
      setState(() => _authToken = token);
    }
  }

  Future<void> _pickDate() async {
    if (_isLoading) return;
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2101),
    );
    if (picked != null && mounted) {
      setState(() {
        _selectedDate = picked;
        _dateController.text = DateFormat('dd-MM-yyyy').format(picked);
      });
    }
  }

  Future<void> _pickTime() async {
    if (_isLoading) return;
    TimeOfDay? pickedTime;
    await showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        final initialTime = _selectedTime ?? TimeOfDay.now();
        return SizedBox(
          height: 250,
          child: Column(
            children: [
              const Padding(
                padding: EdgeInsets.all(12),
                child: Text(
                  'Select Follow-up Time',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
              Expanded(
                child: CupertinoTimerPicker(
                  mode: CupertinoTimerPickerMode.hm,
                  initialTimerDuration: Duration(
                    hours: initialTime.hour,
                    minutes: initialTime.minute,
                  ),
                  onTimerDurationChanged: (duration) {
                    pickedTime = TimeOfDay(
                      hour: duration.inHours % 24,
                      minute: duration.inMinutes % 60,
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    foregroundColor: Colors.black,
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Done'),
                ),
              ),
            ],
          ),
        );
      },
    );
    if (pickedTime != null && mounted) {
      setState(() {
        _selectedTime = pickedTime!;
        _timeController.text = DateFormat('HH:mm').format(
          DateTime(2000, 1, 1, pickedTime!.hour, pickedTime!.minute),
        );
      });
    }
  }

  Future<void> _addFollowUpToAPI() async {
    if (!_formKey.currentState!.validate()) return;
    if (_authToken == null) {
      _showError('Authentication token is missing');
      return;
    }
    if (_selectedDate == null || _selectedTime == null) {
      _showError('Please select both date and time');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final url = '${widget.domain}add-lead-followup';
      final followupDateTime = DateTime(
        _selectedDate!.year,
        _selectedDate!.month,
        _selectedDate!.day,
        _selectedTime!.hour,
        _selectedTime!.minute,
      );

      final payload = {
        'lead_id': widget.leadId.toString(),
        'followup_date': DateFormat('yyyy-MM-dd').format(_selectedDate!),
        'followup_time': DateFormat('HH:mm').format(followupDateTime),
        'followup_remark': _remarkController.text.trim(),
      };

      final response = await http
          .post(
            Uri.parse(url),
            headers: {
              'Authorization': 'Bearer $_authToken',
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload,
          )
          .timeout(const Duration(seconds: 30));

      if (!mounted) return;

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 &&
          (responseData['status'] == 'success' || responseData['success'] == true)) {
        setState(() {
          _lastRemark = _remarkController.text.trim();
          _followUpRemarks.insert(0, {
            'remark': _remarkController.text.trim(),
            'by': 'You',
            'date': DateFormat('dd-MM-yyyy HH:mm').format(followupDateTime),
          });
          _clearForm();
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Follow-up added successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        _showError(responseData['message'] ?? 'Failed to add follow-up');
      }
    } on TimeoutException {
      _showError('Request timed out. Please try again.');
    } catch (e) {
      _showError('Network error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    }
  }

  void _clearForm() {
    _remarkController.clear();
    _dateController.clear();
    _timeController.clear();
    setState(() {
      _selectedDate = null;
      _selectedTime = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Follow-Up for ${widget.leadName}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Follow-up Date', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextFormField(
                readOnly: true,
                onTap: _isLoading ? null : _pickDate,
                controller: _dateController,
                decoration: const InputDecoration(
                  hintText: 'dd-mm-yyyy',
                  suffixIcon: Icon(Icons.calendar_today),
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.isEmpty ? 'Please select a date' : null,
              ),
              const SizedBox(height: 16),
              const Text('Follow-up Time', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextFormField(
                readOnly: true,
                onTap: _isLoading ? null : _pickTime,
                controller: _timeController,
                decoration: const InputDecoration(
                  hintText: 'hh:mm',
                  suffixIcon: Icon(Icons.access_time),
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.isEmpty ? 'Please select a time' : null,
              ),
              const SizedBox(height: 16),
              const Text('Follow-up Remark', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextFormField(
                controller: _remarkController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Enter remark...',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.trim().isEmpty ? 'Remark is required' : null,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber,
                        foregroundColor: Colors.black,
                      ),
                      onPressed: _isLoading ? null : _addFollowUpToAPI,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.black,
                              ),
                            )
                          : const Text('Add'),
                    ),
                  ),
                ],
              ),

              // FOLLOW-UP HISTORY AND LAST REMARK — COMMENTED BELOW
              /*
              const SizedBox(height: 32),
              const Divider(),
              const Text(
                'Follow-up History',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 16),
              _followUpRemarks.isEmpty
                  ? const Center(child: Text('No follow-up remarks found.'))
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _followUpRemarks.length,
                      itemBuilder: (context, index) {
                        final item = _followUpRemarks[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          child: ListTile(
                            title: Text(item['remark']!),
                            subtitle: Text('By: ${item['by']} • On: ${item['date']}'),
                          ),
                        );
                      },
                    ),
              */
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _remarkController.dispose();
    _dateController.dispose();
    _timeController.dispose();
    super.dispose();
  }
}
