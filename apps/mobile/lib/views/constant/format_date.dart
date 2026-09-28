import 'package:intl/intl.dart';

String formatDate(String dateStr) {
  try {
    DateTime parsedDate = DateTime.parse(dateStr);
    return DateFormat("dd MMM yyyy").format(parsedDate);
  } catch (e) {
    return "Invalid Date"; // Handle errors gracefully
  }
}