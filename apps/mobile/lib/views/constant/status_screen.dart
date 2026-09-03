import 'package:flutter/material.dart';
import 'package:etaxwala/views/constant/follow_up.dart';
import 'package:etaxwala/views/constant/update_status.dart';
import 'package:etaxwala/views/constant/domain.dart'; // ✅ This line fixes the error


class StatusScreen extends StatelessWidget {
  final int leadId;
  final String leadName;

  const StatusScreen({
    super.key,
    required this.leadId,
    required this.leadName,
  });

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.amber,
          title: Text(
            "Lead Status: $leadName",
            style: const TextStyle(color: Colors.black),
          ),
          iconTheme: const IconThemeData(color: Colors.black),
          bottom: const TabBar(
            labelColor: Colors.black,
            unselectedLabelColor: Colors.grey,
            indicatorColor: Colors.black,
            indicatorWeight: 3.0,
            tabs: [
              Tab(
                text: "Follow-Up",
                icon: Icon(Icons.schedule),
              ),
              Tab(
                text: "Update Status",
                icon: Icon(Icons.update),
              ),
            ],
          ),
        ),
        body: TabBarView(
  children: [
    FollowUpScreen(
      leadId: leadId,
      leadName: leadName,
      domain: domain, // ✅ Make sure this variable is defined
    ),
    UpdateStatusScreen(
      leadId: leadId,
      leadName: leadName,
     domain: domain,
    ),
  ],
),


      ),
    );
  }
}
