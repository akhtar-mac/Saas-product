import 'package:flutter/material.dart';

// Status mapping for lead statuses
final Map<int, Map<String, dynamic>> leadStatusMap = {
  0: {"label": "New", "color": Colors.blue},
  1: {"label": "Not Interested", "color": Colors.grey},
  2: {"label": "Interested", "color": Colors.orange},
  3: {"label": "Quotation", "color": Colors.purple},
  4: {"label": "Hot", "color": Colors.red},
  5: {"label": "Customer", "color": Colors.green},
  6: {"label": "Not Connected", "color": Colors.brown},
  7: {"label": "Negotiation", "color": Colors.teal},
  8: {"label": "Prospected", "color": Colors.cyan},
  9: {"label": "Customer Follow-up", "color": Colors.pink},
};
