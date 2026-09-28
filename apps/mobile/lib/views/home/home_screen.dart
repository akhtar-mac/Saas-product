import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:shimmer/shimmer.dart';

import 'package:etaxwala/views/constant/lead_status.dart';
import 'package:etaxwala/views/constant/domain.dart';
import 'package:etaxwala/views/constant/format_date.dart';
import 'package:etaxwala/views/constant/openWhatsapp.dart';
import 'package:etaxwala/views/constant/open_dialer.dart';
import 'package:etaxwala/views/helper/shared_prefs_helper.dart';
import 'package:etaxwala/views/helper/auth_helper.dart';
import 'package:etaxwala/views/modal/show_remarks.dart';
import 'package:etaxwala/views/screens/LeadDetailsScreen.dart';
import 'package:etaxwala/views/screens/notification_screen.dart';
import 'package:etaxwala/views/helper/navigation_helper.dart';
import 'package:etaxwala/views/constant/status_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with AutomaticKeepAliveClientMixin {
  int _selectedIndex = 0;
  String? authToken;
  int? userID;
  String? userName;

  int currentPage = 1;
  bool isLoading = false;
  bool hasMore = true;
  List<dynamic> allLeads = [];
  List<dynamic> filteredLeads = [];
  String searchQuery = "";
  int? selectedStatus;

  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();

  Timer? _debounce;

  Map<String, int> statusMap = {
    "Total": -1,
    "New": 0,
    "Not Interested": 1,
    "Interested": 2,
    "Quotation": 3,
    "Hot": 4,
    "Customer": 5,
    "Not Connected": 6,
    "Negotiation": 7,
    "Prospected": 8,
  };

  @override
  void initState() {
    super.initState();
    _initialize();
    _scrollController.addListener(_scrollListener);
    _searchController.addListener(_onSearchChanged);
  }

  Future<void> _initialize() async {
    await _loadAuthData();
    if (mounted) {
      fetchLeads();
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      _applyFilters();
    });
  }

  Future<void> _loadAuthData() async {
    String? token = await SharedPrefsHelper.getAuthToken();
    int? uId = await SharedPrefsHelper.getUserID();
    String? uName = await SharedPrefsHelper.getUserName();

    setState(() {
      authToken = token;
      userID = uId;
      userName = uName;
    });
  }

  Future<void> fetchLeads() async {
    if (isLoading || !hasMore) return;

    setState(() => isLoading = true);

    try {
      final response = await http.post(
        Uri.parse("$getAllLeads?page=$currentPage&limit=10"),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $authToken",
        },
        body: jsonEncode({"userID": userID}),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        final List<dynamic> newLeads = responseData["leads"] as List<dynamic>;

        if (newLeads.isNotEmpty) {
          if (mounted) {
            setState(() {
              allLeads.addAll(newLeads);
              currentPage++;
              hasMore = currentPage <= responseData["last_page"];
              _applyFilters();
              isLoading = false;
            });
          }
        } else {
          setState(() {
            hasMore = false;
            isLoading = false;
          });
        }
      } else {
        setState(() => isLoading = false);
      }
    } catch (e) {
      print("Error fetching leads: $e");
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _applyFilters() {
    final query = _searchController.text.toLowerCase();

    setState(() {
      filteredLeads = allLeads.where((lead) {
        final name = (lead["name"] ?? "").toString().toLowerCase();
        final phone = (lead["phone"] ?? "").toString().toLowerCase();
        final matchesSearch = query.isEmpty || name.contains(query) || phone.contains(query);

        final status = lead["status"];
        final matchesStatus = selectedStatus == null || selectedStatus == -1 || status == selectedStatus;

        return matchesSearch && matchesStatus;
      }).toList();
    });
  }

  void _onStatusSelected(int? status) {
    setState(() {
      selectedStatus = status;
      _applyFilters();
    });
  }

  int _getLeadCount(int status) {
    if (status == -1) return allLeads.length;
    return allLeads.where((lead) => lead["status"] == status).length;
  }

  Future<void> _refreshLeads() async {
    setState(() {
      allLeads.clear();
      filteredLeads.clear();
      currentPage = 1;
      hasMore = true;
    });

    await fetchLeads();
  }

  void _scrollListener() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 100 &&
        !isLoading) {
      Future.delayed(const Duration(milliseconds: 500), fetchLeads);
    }
  }

  void _onItemTapped(int index) {
    if (index == _selectedIndex) return;

    setState(() {
      _selectedIndex = index;
    });

    NavigationHelper.navigateToScreen(context, index);
  }

  Future<void> _showLeadRemarks(int id, String name) async {
    print(id);
    List<Map<String, dynamic>> leadRemarks = [];

    try {
      final response = await http.get(
        Uri.parse("$getLeadRemark?lead_id=$id"),
        headers: {"Content-Type": "application/json"},
      );

      print(json.decode(response.body));

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);

        if ( responseData["data"] is List) {
          leadRemarks = List<Map<String, dynamic>>.from(responseData["data"].map((data) {
            return {
              "id": data["id"],
              "remark": data["followup_remark"] ?? "No Remark",
              "added_by": userName ?? "Unknown User",
              "date": data["date"] ?? "N/A",
            };
          }));
        }
      }
    } catch (e) {
      print("Error fetching remarks: $e");
    }

    if (context.mounted) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        builder: (context) => LeadRemarksModal(leadRemarks: leadRemarks, leadName: name),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // For AutomaticKeepAliveClientMixin

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.amber,
        
        title: Text(userName ?? 'Guest'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const NotificationScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              AuthHelper.logout(context);
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.search),
                      hintText: "Search by name or phone...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: statusMap.entries.map((entry) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 10),
                    child: FilterChip(
                      label: Text("${entry.key} (${_getLeadCount(entry.value)})"),
                      selected: selectedStatus == entry.value,
                      onSelected: (selected) =>
                          _onStatusSelected(selected ? entry.value : null),
                      selectedColor: Colors.amber,
                      backgroundColor: Colors.grey[200],
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _refreshLeads,
                child: filteredLeads.isEmpty && isLoading
                    ? _buildShimmerLoading()
                    : filteredLeads.isEmpty
                        ? const Center(child: Text("No leads found."))
                        : ListView.builder(
                            key: const PageStorageKey<String>('leads_list'),
                            controller: _scrollController,
                            physics: const BouncingScrollPhysics(),
                            itemCount: filteredLeads.length + (hasMore ? 1 : 0),
                            itemBuilder: (context, index) {
                              if (index == filteredLeads.length) {
                                return const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(10),
                                    child: CircularProgressIndicator(),
                                  ),
                                );
                              }

                              final lead = filteredLeads[index];
                              final status =
                                  int.tryParse(lead["status"].toString()) ?? 0;

                              return _buildLeadCard(lead, status);
                            },
                          ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Colors.black,
        unselectedItemColor: Colors.grey,
        backgroundColor: Colors.amber,
        elevation: 10,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.description), label: "Quotations"),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: "Appointments"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }

  Widget _buildLeadCard(dynamic lead, int status) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 0),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.all(10.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Name & Status Chip Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  (lead["name"] != null && lead["name"].length > 25)
                      ? "${lead["name"].substring(0, 20)}..."
                      : lead["name"] ?? "Unknown Lead",
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => StatusScreen(
                          leadId: lead["id"],
                          leadName: lead["name"],
                        ),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: leadStatusMap[status]?["color"] ?? Colors.blueAccent,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: Text(
                      leadStatusMap[status]?["label"] ?? "New",
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 5),
            // Follow-up date
            Text(
              "Followup date - ${lead["latest_followup_date"] != null ? formatDate(lead["latest_followup_date"]) : "N/A"}",
              style: TextStyle(fontSize: 14, color: Colors.grey[700]),
            ),
            const SizedBox(height: 5),
            // City Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "City",
                  style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                ),
                Text(
                  (lead["city"] != null && lead["city"].length > 25)
                      ? "${lead["city"].substring(0, 25)}..."
                      : lead["city"] ?? "Unknown",
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[700],
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 5),
            // Service Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "Service",
                  style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                ),
                Text(
                  (lead["SName"] != null && lead["SName"].length > 25)
                      ? "${lead["SName"].substring(0, 25)}..."
                      : (lead["SName"] ??
                          (lead["service"] != null && lead["service"].length > 25
                              ? "${lead["service"].substring(0, 25)}..."
                              : lead["service"] ?? 'N/A')),
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[700],
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            // Action Buttons Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: FaIcon(FontAwesomeIcons.whatsapp, color: Colors.green, size: 25),
                      onPressed: () => openwhatsapp(lead["phone"]),
                    ),
                    const SizedBox(width: 1),
                    const Icon(Icons.play_arrow, color: Colors.black, size: 30),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.info, color: Colors.lightBlueAccent, size: 28),
                      onPressed: () {
                        _showLeadRemarks(lead["id"], lead["name"]);
                      },
                    ),
                  ],
                ),
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        openDialer(lead["phone"]);
                      },
                      style: ButtonStyle(
                        backgroundColor: MaterialStateProperty.all(Colors.amber),
                        shape: MaterialStateProperty.all(
                          RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                      child: const Text(
                        "Call",
                        style: TextStyle(color: Colors.black, fontSize: 14),
                      ),
                    ),
                    const SizedBox(width: 5),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => LeadDetailsScreen(leadId: lead["id"]),
                          ),
                        );
                      },
                      style: ButtonStyle(
                        backgroundColor: MaterialStateProperty.all(Colors.black),
                        shape: MaterialStateProperty.all(
                          RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                      child: const Text(
                        "Details",
                        style: TextStyle(fontSize: 14, color: Colors.amber),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListView.builder(
        itemCount: 6, 
        itemBuilder: (_, __) => Container(
          margin: const EdgeInsets.symmetric(vertical: 8),
          height: 80,
          color: Colors.white,
        ),
      ),
    );
  }

  @override
  bool get wantKeepAlive => true;
}
