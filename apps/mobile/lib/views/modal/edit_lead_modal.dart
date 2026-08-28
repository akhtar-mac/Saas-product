import 'package:flutter/material.dart';

class EditLeadModal extends StatefulWidget {
  final int leadId;
  final String domain; // Base URL for API
  final GlobalKey<FormState> formKey;
  final Future<void> Function() fetchAllServices;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final TextEditingController emailController;
  final TextEditingController stateController;
  final TextEditingController cityController;
  final int? selectedServiceId;
  final String? selectedServiceName;
  final Map<String, int> allServices;
  final Function(int?) onServiceChanged;
  final VoidCallback onSaveLead;
  final bool isUpdating;

  const EditLeadModal({
    super.key,
    required this.leadId,
    required this.domain,
    required this.formKey,
    required this.fetchAllServices,
    required this.nameController,
    required this.phoneController,
    required this.emailController,
    required this.stateController,
    required this.cityController,
    required this.selectedServiceId,
    required this.selectedServiceName,
    required this.allServices,
    required this.onServiceChanged,
    required this.onSaveLead,
    required this.isUpdating,
  });

  @override
  State<EditLeadModal> createState() => _EditLeadModalState();
}

class _EditLeadModalState extends State<EditLeadModal> {
  bool _isLocalLoading = false;

  void _updateLead() {
    if (!widget.formKey.currentState!.validate()) return;

    setState(() => _isLocalLoading = true);
    try {
      widget.onSaveLead(); // Trigger parent callback
      Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        _showError('Error: $e');
      }
    } finally {
      if (mounted) setState(() => _isLocalLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String? Function(String?) validator,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
        ),
        validator: validator,
      ),
    );
  }
  @override 
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: SingleChildScrollView(
        child: Form(
          key: widget.formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Edit Lead",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              // Name
              _buildTextField(
                controller: widget.nameController,
                label: "Name",
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return "Please enter a name";
                  }
                  if (value.trim().length < 2) {
                    return "Name must be at least 2 characters long";
                  }
                  return null;
                },
              ),

              // Phone
              _buildTextField(
                controller: widget.phoneController,
                label: "Phone",
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return "Please enter a phone number";
                  }
                  if (!RegExp(r'^\+?[0-9]{10,15}$').hasMatch(value.trim())) {
                    return "Enter a valid phone number";
                  }
                  return null;
                },
              ),

              // Email
              _buildTextField(
                controller: widget.emailController,
                label: "Email",
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return "Please enter an email";
                  }
                  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                      .hasMatch(value.trim())) {
                    return "Enter a valid email";
                  }
                  return null;
                },
              ),

              // State
              
              _buildTextField(
                controller: widget.stateController,
                label: "State",
                validator: (value) =>
                    value == null || value.trim().isEmpty ? "Enter a state" : null,
              ),

              // City
              _buildTextField(
                controller: widget.cityController,
                label: "City",
                validator: (value) =>
                    value == null || value.trim().isEmpty ? "Enter a city" : null,
              ),

              // Service Dropdown
              Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: DropdownButtonFormField<int>(
                  value: widget.selectedServiceId,
                  isExpanded: true,
                  decoration: const InputDecoration(
                    labelText: "Service",
                    border: OutlineInputBorder(),
                  ),
                  items: widget.allServices.entries.map((entry) {
                    return DropdownMenuItem<int>(
                      value: entry.value,
                      child: Text(entry.key, overflow: TextOverflow.ellipsis),
                    );
                  }).toList(),
                  onChanged: widget.onServiceChanged,
                  validator: (value) =>
                      value == null ? "Please select a service" : null,
                ),
              ),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLocalLoading ? null : _updateLead,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLocalLoading
                      ? const CircularProgressIndicator(color: Colors.black)
                      : const Text(
                          "Update Lead",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.black,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}