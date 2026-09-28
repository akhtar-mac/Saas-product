import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:etaxwala/views/helper/shared_prefs_helper.dart';
import 'package:etaxwala/views/constant/domain.dart';

class UpdateStatusScreen extends StatefulWidget {
  final int leadId;
  final String leadName;
  final String domain;

  const UpdateStatusScreen({
    super.key,
    required this.leadId,
    required this.leadName,
    required this.domain,
  });

  @override
  State<UpdateStatusScreen> createState() => _UpdateStatusScreenState();
}

class _UpdateStatusScreenState extends State<UpdateStatusScreen> {
  int? _selectedStatus;
  final _remarkController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String? _authToken;
  bool _isLoading = false;
  String _lastLeadRemark = '';
  List<Map<String, String>> _followUpHistory = [];

  static const _leadStatusMap = {
    0: {'label': 'New', 'color': Colors.blue},
    1: {'label': 'Not Interested', 'color': Colors.grey},
    2: {'label': 'Interested', 'color': Colors.orange},
    3: {'label': 'Quotation', 'color': Colors.purple},
    4: {'label': 'Hot', 'color': Colors.red},
    5: {'label': 'Customer', 'color': Colors.green},
    6: {'label': 'Not Connected', 'color': Colors.brown},
    7: {'label': 'Negotiation', 'color': Colors.teal},
    8: {'label': 'Prospected', 'color': Colors.cyan},
    9: {'label': 'Customer Follow-up', 'color': Colors.pink},
  };

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

  Future<void> _updateStatusToAPI() async {
    if (!_formKey.currentState!.validate()) return;
    if (_authToken == null) {
      _showError('Authentication token is missing');
      return;
    }

    setState(() => _isLoading = true);
    http.Response? response;

    try {
      final url = '${widget.domain}update-lead-status';
      final payload = {
        'token': _authToken,
        'lead_id': widget.leadId,
        'lead_status': _selectedStatus,
        'lead_remark': _remarkController.text.trim(),
      };

      final headers = {'Content-Type': 'application/json'};

      response = await http
          .post(
            Uri.parse(url),
            headers: headers,
            body: json.encode(payload),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 404) {
        _showError('API endpoint not found. Please check the URL.');
        return;
      }

      final responseData = jsonDecode(response.body) as Map<String, dynamic>;

      if (responseData['success'] == true) {
        if (mounted) {
          setState(() {
            _lastLeadRemark = _remarkController.text.trim();
            _followUpHistory.insert(0, {
              'remark': _remarkController.text.trim(),
              'date': DateTime.now().toString(),
            });
            _clearForm();
          });

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Status updated successfully!'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context);
        }
      } else {
        _showError(responseData['message'] ?? 'Failed to update status');
      }
    } catch (e) {
      _showError(
        e is FormatException
            ? 'Invalid server response. Please contact support.'
            : e is TimeoutException
                ? 'Request timed out. Please try again later.'
                : 'Network error. Check your connection or server status.',
      );
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
    setState(() {
      _selectedStatus = null;
      _remarkController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Update Status for ${widget.leadName}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Lead Status'),
              const SizedBox(height: 4),
              DropdownButtonFormField<int>(
                value: _selectedStatus,
                items: _leadStatusMap.entries.map((entry) {
                  return DropdownMenuItem<int>(
                    value: entry.key,
                    child: Row(
                      children: [
                        Icon(
                          Icons.circle,
                          size: 12,
                          color: entry.value['color'] as Color,
                        ),
                        const SizedBox(width: 8),
                        Text(entry.value['label'] as String),
                      ],
                    ),
                  );
                }).toList(),
                onChanged:
                    _isLoading ? null : (value) => setState(() => _selectedStatus = value),
                decoration: const InputDecoration(
                  hintText: 'Select Status',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value == null ? 'Please select a status' : null,
              ),
              const SizedBox(height: 12),
              const Text('Lead Remark'),
              const SizedBox(height: 4),
              TextFormField(
                controller: _remarkController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Enter remark...',
                  border: OutlineInputBorder(),
                ),
                validator: (value) =>
                    value?.trim().isEmpty ?? true ? 'Remark is required' : null,
              ),

              // ==== LAST LEAD REMARK SECTION (COMMENTED) ====
              /*
              const SizedBox(height: 16),
              const Text('Last Lead Remark'),
              const SizedBox(height: 4),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  _lastLeadRemark.isEmpty ? 'No previous remark' : _lastLeadRemark,
                ),
              ),
              */

              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                      ),
                      onPressed: _isLoading ? null : _clearForm,
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber,
                        foregroundColor: Colors.black,
                      ),
                      onPressed: _isLoading ? null : _updateStatusToAPI,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.black,
                              ),
                            )
                          : const Text('Update'),
                    ),
                  ),
                ],
              ),

              // ==== FOLLOW-UP HISTORY SECTION (COMMENTED) ====
              /*
              const SizedBox(height: 32),
              const Divider(),
              const Text(
                'Follow-up History',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 16),
              _followUpHistory.isEmpty
                  ? const Center(child: Text('No follow-up history found.'))
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _followUpHistory.length,
                      itemBuilder: (context, index) {
                        final item = _followUpHistory[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          child: ListTile(
                            title: Text(item['remark'] ?? ''),
                            subtitle: Text('On: ${item['date'] ?? ''}'),
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
    super.dispose();
  }
}
