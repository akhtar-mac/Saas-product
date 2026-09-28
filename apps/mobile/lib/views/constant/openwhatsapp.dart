import 'package:url_launcher/url_launcher.dart';

void openwhatsapp(String phone) async {
  final Uri url = Uri.parse("https://wa.me/${Uri.encodeFull(phone)}");
  String message =
      "Hello, I am interested in your product. Please send me more details.";
  String cleanedPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
  String encodedMessage = Uri.encodeComponent(message);

  final Uri whatsappUrl = Uri.parse("https://wa.me/$cleanedPhone?text=$encodedMessage");
  
  // Debugging
  print("Opening WhatsApp URL: $whatsappUrl");

  if (!await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication)) {
    print("Could not open WhatsApp");
  }
}
