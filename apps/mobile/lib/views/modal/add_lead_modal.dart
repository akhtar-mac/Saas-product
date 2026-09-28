// import 'package:flutter/material.dart';

// class AddLeadModal extends StatefulWidget {
//   final TextEditingController nameController;
//   final TextEditingController phoneController;
//   final TextEditingController emailController;
//   final TextEditingController stateController;
//   final TextEditingController cityController;
//   final int? selectedService;
//   final Map<String, int> allServices;
//   final Function(int?) onServiceChanged;
//   final VoidCallback onSaveLead;

//   const AddLeadModal({
//     super.key,
//     required this.nameController,
//     required this.phoneController,
//     required this.emailController,
//     required this.stateController,
//     required this.cityController,
//     required this.selectedService,
//     required this.allServices,
//     required this.onServiceChanged,
//     required this.onSaveLead,
//   });

//   @override
//   State<AddLeadModal> createState() => _AddLeadModalState();
// }

// class _AddLeadModalState extends State<AddLeadModal>
//     with SingleTickerProviderStateMixin {
//   bool isButtonEnabled = false;
//   late AnimationController _animationController;
//   late Animation<double> _fadeAnimation;
//   int? _selectedService;

//   @override
//   void initState() {
//     super.initState();
//     _selectedService = widget.selectedService;

//     _animationController = AnimationController(
//       duration: const Duration(milliseconds: 300),
//       vsync: this,
//     );
//     _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
//       CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
//     );
//     _animationController.forward();

//     widget.nameController.addListener(_validateFields);
//     widget.phoneController.addListener(_validateFields);
//     widget.emailController.addListener(_validateFields);
//     widget.stateController.addListener(_validateFields);
//     widget.cityController.addListener(_validateFields);

//     _validateFields();
//   }

//   @override
//   void dispose() {
//     _animationController.dispose();
//     widget.nameController.removeListener(_validateFields);
//     widget.phoneController.removeListener(_validateFields);
//     widget.emailController.removeListener(_validateFields);
//     widget.stateController.removeListener(_validateFields);
//     widget.cityController.removeListener(_validateFields);
//     super.dispose();
//   }

//   void _validateFields() {
//     setState(() {
//       isButtonEnabled = widget.nameController.text.trim().isNotEmpty &&
//           widget.phoneController.text.trim().isNotEmpty &&
//           widget.emailController.text.trim().isNotEmpty &&
//           widget.stateController.text.trim().isNotEmpty &&
//           widget.cityController.text.trim().isNotEmpty &&
//           _selectedService != null;
//     });
//   }

//   // Method to clear all form fields
//   void _clearForm() {
//     widget.nameController.clear();
//     widget.phoneController.clear();
//     widget.emailController.clear();
//     widget.stateController.clear();
//     widget.cityController.clear();
//     setState(() {
//       _selectedService = null;
//     });
//     widget.onServiceChanged(null);
//     _validateFields();
//   }

//   // Method to handle save lead with form clearing
//   void _handleSaveLead() async {
//     try {
//       // Call the original save lead function
//       widget.onSaveLead();
      
//       // Wait a bit for the API call to complete
//       await Future.delayed(const Duration(milliseconds: 100));
      
//       // Clear the form after submission
//       _clearForm();
      
//       // Show a success message
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(
//           const SnackBar(
//             content: Text('Lead added successfully!'),
//             backgroundColor: Colors.green,
//             duration: Duration(seconds: 2),
//           ),
//         );
        
//         // Optional: Close the modal after a brief delay
//         Future.delayed(const Duration(milliseconds: 500), () {
//           if (mounted) {
//             Navigator.of(context).pop();
//           }
//         });
//       }
//     } catch (e) {
//       // Handle any errors
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(
//           SnackBar(
//             content: Text('Error adding lead: $e'),
//             backgroundColor: Colors.red,
//             duration: const Duration(seconds: 3),
//           ),
//         );
//       }
//     }
//   }

//   Widget _buildTextField({
//     required TextEditingController controller,
//     required String label,
//     required IconData icon,
//     TextInputType? keyboardType,
//     String? hint,
//   }) {
//     return Container(
//       decoration: BoxDecoration(
//         borderRadius: BorderRadius.circular(8),
//         boxShadow: [
//           BoxShadow(
//             color: Colors.black.withOpacity(0.05),
//             blurRadius: 8,
//             offset: const Offset(0, 2),
//           ),
//         ],
//       ),
//       child: TextField(
//         controller: controller,
//         keyboardType: keyboardType,
//         style: const TextStyle(fontSize: 16),
//         decoration: InputDecoration(
//           labelText: label,
//           hintText: hint,
//           prefixIcon: Icon(icon, color: Colors.amber),
//           labelStyle: const TextStyle(color: Colors.black54),
//           hintStyle: TextStyle(color: Colors.grey[600]),
//           filled: true,
//           fillColor: Colors.white,
//           border: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(8),
//             borderSide: BorderSide.none,
//           ),
//           enabledBorder: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(8),
//             borderSide: BorderSide(color: Colors.grey[300]!, width: 1),
//           ),
//           focusedBorder: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(8),
//             borderSide: const BorderSide(color: Colors.amber, width: 2),
//           ),
//           contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
//         ),
//       ),
//     );
//   }

//   Widget _buildServiceDropdown() {
//     return Container(
//       decoration: BoxDecoration(
//         borderRadius: BorderRadius.circular(8),
//         boxShadow: [
//           BoxShadow(
//             color: Colors.black.withOpacity(0.05),
//             blurRadius: 8,
//             offset: const Offset(0, 2),
//           ),
//         ],
//       ),
//       child: DropdownButtonFormField<int>(
//         value: _selectedService,
//         onChanged: (value) {
//           setState(() {
//             _selectedService = value;
//           });
//           widget.onServiceChanged(value);
//           _validateFields();
//         },
//         decoration: InputDecoration(
//           labelText: "Service",
//           hintText: "Select a service",
//           prefixIcon: const Icon(Icons.business_center, color: Colors.amber),
//           labelStyle: const TextStyle(color: Colors.black54),
//           hintStyle: TextStyle(color: Colors.grey[600]),
//           filled: true,
//           fillColor: Colors.white,
//           border: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(8),
//             borderSide: BorderSide.none,
//           ),
//           enabledBorder: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(8),
//             borderSide: BorderSide(color: Colors.grey[300]!, width: 1),
//           ),
//           focusedBorder: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(8),
//             borderSide: const BorderSide(color: Colors.amber, width: 2),
//           ),
//           contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
//         ),
//         items: widget.allServices.entries.map((entry) {
//           return DropdownMenuItem<int>(
//             value: entry.value,
//             child: Text(
//               entry.key,
//               style: const TextStyle(fontSize: 16),
//               overflow: TextOverflow.ellipsis,
//             ),
//           );
//         }).toList(),
//         selectedItemBuilder: (BuildContext context) {
//           return widget.allServices.entries.map((entry) {
//             String truncatedName = entry.key.length > 25
//                 ? '${entry.key.substring(0, 25)}...'
//                 : entry.key;
//             return Text(
//               truncatedName,
//               style: const TextStyle(fontSize: 16),
//             );
//           }).toList();
//         },
//         icon: const Icon(Icons.keyboard_arrow_down, color: Colors.amber),
//         dropdownColor: Colors.white,
//         isExpanded: true,
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return FadeTransition(
//       opacity: _fadeAnimation,
//       child: Container(
//         decoration: const BoxDecoration(
//           color: Colors.white,
//           borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
//         ),
//         child: Padding(
//           padding: EdgeInsets.only(
//             left: 16,
//             right: 16,
//             top: 16,
//             bottom: MediaQuery.of(context).viewInsets.bottom + 16,
//           ),
//           child: SingleChildScrollView(
//             child: Column(
//               mainAxisSize: MainAxisSize.min,
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Row(
//                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                   children: [
//                     const Text(
//                       "Add New Lead",
//                       style: TextStyle(
//                         fontSize: 22,
//                         fontWeight: FontWeight.bold,
//                         color: Colors.black,
//                       ),
//                     ),
//                     IconButton(
//                       onPressed: () => Navigator.of(context).pop(),
//                       icon: const Icon(Icons.close, color: Colors.black54),
//                       style: IconButton.styleFrom(
//                         backgroundColor: Colors.grey[200],
//                         shape: const CircleBorder(),
//                       ),
//                     ),
//                   ],
//                 ),
//                 const SizedBox(height: 5),
//                 const Text(
//                   "Fill in the details to add a new lead to your system",
//                   style: TextStyle(
//                     fontSize: 16,
//                     color: Colors.black54,
//                   ),
//                 ),
//                 const SizedBox(height: 20),

//                 _buildSectionHeader("Personal Information", Icons.person),
//                 const SizedBox(height: 10),
//                 _buildTextField(
//                   controller: widget.nameController,
//                   label: "Full Name",
//                   icon: Icons.person,
//                   hint: "Enter full name",
//                 ),
//                 const SizedBox(height: 16),
//                 _buildTextField(
//                   controller: widget.phoneController,
//                   label: "Phone Number",
//                   icon: Icons.phone,
//                   keyboardType: TextInputType.phone,
//                   hint: "Enter phone number",
//                 ),
//                 const SizedBox(height: 16),
//                 _buildTextField(
//                   controller: widget.emailController,
//                   label: "Email Address",
//                   icon: Icons.email,
//                   keyboardType: TextInputType.emailAddress,
//                   hint: "Enter email address",
//                 ),
//                 const SizedBox(height: 20),

//                 _buildSectionHeader("Service Information", Icons.business_center),
//                 const SizedBox(height: 10),
//                 _buildServiceDropdown(),
//                 const SizedBox(height: 20),

//                 _buildSectionHeader("Location Information", Icons.location_on),
//                 const SizedBox(height: 10),
//                 Row(
//                   children: [
//                     Expanded(
//                       child: _buildTextField(
//                         controller: widget.stateController,
//                         label: "State",
//                         icon: Icons.map,
//                         hint: "Enter state",
//                       ),
//                     ),
//                     const SizedBox(width: 16),
//                     Expanded(
//                       child: _buildTextField(
//                         controller: widget.cityController,
//                         label: "City",
//                         icon: Icons.location_city,
//                         hint: "Enter city",
//                       ),
//                     ),
//                   ],
//                 ),
//                 const SizedBox(height: 20),

//                 SizedBox(
//                   width: double.infinity,
//                   child: ElevatedButton.icon(
//                     onPressed: isButtonEnabled ? _handleSaveLead : null,
//                     icon: Icon(
//                       Icons.add_circle,
//                       color: isButtonEnabled ? Colors.black : Colors.grey[500],
//                     ),
//                     label: const Text("Add New Lead"),
//                     style: ElevatedButton.styleFrom(
//                       backgroundColor: isButtonEnabled
//                           ? Colors.amber
//                           : Colors.grey[300],
//                       foregroundColor: isButtonEnabled
//                           ? Colors.black
//                           : Colors.grey[500],
//                       padding: const EdgeInsets.symmetric(vertical: 14),
//                       elevation: isButtonEnabled ? 2 : 0,
//                       shape: RoundedRectangleBorder(
//                         borderRadius: BorderRadius.circular(8),
//                       ),
//                       textStyle: const TextStyle(
//                         fontSize: 16,
//                         fontWeight: FontWeight.w600,
//                       ),
//                     ),
//                   ),
//                 ),
//                 const SizedBox(height: 10),
//               ],
//             ),
//           ),
//         ),
//       ),
//     );
//   }

//   Widget _buildSectionHeader(String title, IconData icon) {
//     return Row(
//       children: [
//         Icon(
//           icon,
//           size: 20,
//           color: Colors.amber,
//         ),
//         const SizedBox(width: 8),
//         Text(
//           title,
//           style: const TextStyle(
//             fontSize: 16,
//             fontWeight: FontWeight.bold,
//             color: Colors.black,
//           ),
//         ),
//       ],
//     );
//   }
// }