import 'package:flutter/material.dart';

class LeadRemarksModal extends StatelessWidget {
  final List<Map<String, dynamic>> leadRemarks;
  final String leadName;

  const LeadRemarksModal({
    super.key,
    required this.leadRemarks,
    required this.leadName,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8, // 80% of screen height
      decoration: BoxDecoration(
        color: Colors.white, // Background color
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(20),
        ), // Top border radius
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 🔹 Title Section with Background Color
          Container(
            padding: EdgeInsets.all(16),
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.amber, // Background color for title
              borderRadius: BorderRadius.vertical(
                  top: Radius.circular(20)), // Matches modal border radius
            ),
            child: Column(
              children: [
                Text(
                  "Lead Remarks",
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 5), // Space between texts
                Text(
                  leadName,
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                      color: Colors.black),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          SizedBox(height: 10),

          // 🔹 Lead Remarks List
          Expanded(
            child: leadRemarks.isEmpty
                ? Center(
                    child: Text("No remarks found",
                        style: TextStyle(color: Colors.black)))
                : ListView.builder(
                    itemCount: leadRemarks.length,
                    itemBuilder: (context, index) {
                      final remark = leadRemarks[index];
                      return Card(
                        margin:
                            EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        child: Padding(
                          padding: EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                remark["remark"],
                                style: TextStyle(
                                    fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                              SizedBox(height: 5),
                              Text(
                                "By: ${remark["added_by"] ?? "Unknown"}",
                                style: TextStyle(
                                    fontSize: 12, fontWeight: FontWeight.w500),
                              ),
                              SizedBox(height: 5),
                              Text(
                                "On: ${remark["date"] ?? "N/A"}",
                                style: TextStyle(
                                    fontSize: 12, fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // 🔹 Close Button Section with Background Color

          Container(
            
            padding: EdgeInsets.all(16),
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors
                  .grey.shade200, // Background color for close button section
            ),
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.amber, // Button color
                foregroundColor: Colors.black, // Text color
              ),
              onPressed: () => Navigator.pop(context),
              child: Text("Close"),
            ),
          ),
        ],
      ),
    );
  }
}
