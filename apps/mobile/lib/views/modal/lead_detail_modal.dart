// 📁 Full `LeadDetailsScreen` and `EditLeadModal` Integration (Final Working Code)

import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:etaxwala/views/constant/domain.dart';

class EditLeadModal extends StatelessWidget {
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
  final ValueChanged<int?> onServiceChanged;
  final VoidCallback onSaveLead;
  final bool isUpdating;

  const EditLeadModal({
    super.key,
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
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Form(
        key: formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("Edit Lead", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildTextField(label: "Name", controller: nameController),
              _buildTextField(label: "Phone", controller: phoneController),
              _buildTextField(label: "Email", controller: emailController),
              _buildTextField(label: "State", controller: stateController),
              _buildTextField(label: "City", controller: cityController),
              DropdownButtonFormField<int>(
                value: selectedServiceId,
                decoration: const InputDecoration(labelText: "Select Service"),
                items: allServices.entries.map((entry) {
                  return DropdownMenuItem<int>(
                    value: entry.value,
                    child: Text(entry.key),
                  );
                }).toList(),
                onChanged: onServiceChanged,
                validator: (value) => value == null ? 'Please select a service' : null,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: isUpdating ? null : onSaveLead,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: isUpdating
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(color: Colors.amber, strokeWidth: 2.5),
                      )
                    : const Text("Update Lead", style: TextStyle(color: Colors.white, fontSize: 16)),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({required String label, required TextEditingController controller}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(labelText: label, border: OutlineInputBorder()),
        validator: (value) => (value == null || value.trim().isEmpty) ? 'Please enter $label' : null,
      ),
    );
  }
}
