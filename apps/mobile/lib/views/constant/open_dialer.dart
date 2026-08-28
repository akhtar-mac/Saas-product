import 'package:url_launcher/url_launcher.dart';

void openDialer(String phoneNumber) async {
  String contactNo = phoneNumber;
  String cleanedPhone = contactNo.replaceAll(
      RegExp(r'[^\d]'), ''); // Remove +, spaces, and special characters

  final Uri telUri = Uri.parse("tel:$cleanedPhone");

  // Debugging output
  print("Trying to open: $telUri");

  if (await canLaunchUrl(telUri)) {
    await launchUrl(telUri, mode: LaunchMode.externalApplication);
  } else {
    print("Could not open dialer. Trying with DIAL intent...");
    await launchUrl(
        Uri.parse("tel:$cleanedPhone")); // Try without external mode
  }
}
