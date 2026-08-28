import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import 'package:collection/collection.dart';
import 'package:etaxwala/views/constant/domain.dart';
import 'package:etaxwala/views/utils/quotation_pdf.dart';
import 'package:open_filex/open_filex.dart';

// Quotation State Model
class QuotationState with ChangeNotifier {
  static const String _customersCacheKey = 'cached_customers';
  static const String _productsCacheKey = 'cached_products';
  static const String _cacheTimestampKey = 'cache_timestamp';
  static const Duration _cacheDuration = Duration(minutes: 30);
  static const Duration _httpTimeout = Duration(seconds: 8);

  bool _isLoadingCustomers = true;
  bool _isLoadingProducts = true;
  bool _isSubmitting = false;
  bool _isLoadingQuotation = false;
  List<Map<String, dynamic>> _availableCustomers = [];
  List<Map<String, dynamic>> _availableProducts = [];
  List<Map<String, dynamic>> _selectedProducts = [];
  String? _quotationId;
  String? _selectedCustomer;
  String? _selectedProduct;
  String? _customerName;
  String _date = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String _quantity = '1';
  String _discount = '0';
  String _price = '0';
  String _amount = '0';
  Timer? _debounceTimer;

  // Getters
  bool get isLoadingCustomers => _isLoadingCustomers;
  bool get isLoadingProducts => _isLoadingProducts;
  bool get isSubmitting => _isSubmitting;
  bool get isLoadingQuotation => _isLoadingQuotation;
  String? get quotationId => _quotationId;
  List<Map<String, dynamic>> get availableCustomers => _availableCustomers;
  List<Map<String, dynamic>> get availableProducts => _availableProducts;
  List<Map<String, dynamic>> get selectedProducts => _selectedProducts;
  String? get selectedCustomer => _selectedCustomer;
  String? get selectedProduct => _selectedProduct;
  String? get customerName => _customerName;
  String get date => _date;
  String get quantity => _quantity;
  String get discount => _discount;
  String get price => _price;
  String get amount => _amount;

  Future<void> initialize() async {
    await _loadCachedData();
    await Future.wait([
      _fetchWithRetry(_fetchCustomers, () => _isLoadingCustomers = false),
      _fetchWithRetry(_fetchProducts, () => _isLoadingProducts = false),
    ]);
  }

  Future<void> loadQuotation(String quotationId) async {
    _isLoadingQuotation = true;
    _quotationId = quotationId;
    notifyListeners();

    try {
      final token = await _getToken();
      final response = await http.get(
        Uri.parse('$viewQuotationApi/$quotationId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
          'Cache-Control': 'no-cache',
        },
      ).timeout(_httpTimeout);

      print('API Request: GET $viewQuotationApi/$quotationId');
      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final quotation = data['data'] ?? data;
        _selectedCustomer = quotation['lead_id']?.toString();
        _customerName = quotation['customer_name']?.toString() ?? 'Unknown Customer';
        _date = quotation['created_at'] ?? DateFormat('yyyy-MM-dd').format(DateTime.now());
        _selectedProducts = List<Map<String, dynamic>>.from(quotation['products']?.map((p) => {
              'service_id': p['id']?.toString(),
              'service_name': p['service_name'] ?? 'Unknown Product',
              'qty': p['quantity']?.toString() ?? '1',
              'price': p['unit_price']?.toString() ?? '0',
              'discount': p['discount_percentage']?.toString() ?? '0',
              'amount': p['total']?.toString() ?? '0',
            }) ??
            []);
      } else if (response.statusCode == 401) {
        throw Exception('Session expired. Please log in again.');
      } else {
        throw Exception('Failed to load quotation. Status: ${response.statusCode}');
      }
    } catch (e) {
      print('Error loading quotation: $e');
      _quotationId = null;
      _logError('Failed to load quotation: $e');
      _showError(null, 'Failed to load quotation: $e');
      rethrow;
    } finally {
      _isLoadingQuotation = false;
      notifyListeners();
    }
  }

  Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token') ?? '';
    if (token.isEmpty) {
      throw Exception('No authentication token found. Please log in again.');
    }
    return token;
  }

  Future<void> _loadCachedData() async {
    final prefs = await SharedPreferences.getInstance();
    final cachedCustomers = prefs.getString(_customersCacheKey);
    final cachedProducts = prefs.getString(_productsCacheKey);
    final cacheTimestamp = prefs.getInt(_cacheTimestampKey) ?? 0;

    if (DateTime.now().millisecondsSinceEpoch - cacheTimestamp < _cacheDuration.inMilliseconds &&
        cachedCustomers != null &&
        cachedProducts != null) {
      _availableCustomers = List<Map<String, dynamic>>.from(json.decode(cachedCustomers));
      _availableProducts = List<Map<String, dynamic>>.from(json.decode(cachedProducts));
      _isLoadingCustomers = false;
      _isLoadingProducts = false;
      notifyListeners();
    }
  }

  Future<void> _cacheData(String key, List<Map<String, dynamic>> data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, json.encode(data));
    await prefs.setInt(_cacheTimestampKey, DateTime.now().millisecondsSinceEpoch);
  }

  Future<void> _fetchWithRetry(Future<void> Function(String) fetchFunction, void Function() onFinally) async {
    int retryCount = 0;
    const maxRetries = 2;

    while (retryCount < maxRetries) {
      try {
        final token = await _getToken();
        await fetchFunction(token);
        return;
      } catch (e) {
        retryCount++;
        print('Retry attempt ${retryCount} after error: $e');
        if (retryCount == maxRetries) {
          _showError(null, 'Failed to fetch data after $maxRetries attempts: $e');
          break;
        }
        await Future.delayed(const Duration(seconds: 1));
      }
    }
    onFinally();
    notifyListeners();
  }

  Future<void> _fetchCustomers(String token) async {
    _isLoadingCustomers = true;
    notifyListeners();
    try {
      final response = await http.get(
        Uri.parse(getAllCustomers),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token', 'Cache-Control': 'no-cache'},
      );

      print('API Request: GET $getAllCustomers');
      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final customerList = data['data'] is List ? data['data'] : data['customers'] is List ? data['customers'] : [];   
        print (customerList) ; 

        if (customerList is List) {
          final customers = List<Map<String, dynamic>>.from(customerList)
              .where((customer) => customer['id']?.toString().isNotEmpty == true)
              .toList();
          final uniqueCustomers = <String, Map<String, dynamic>>{};
          for (var customer in customers) {
            uniqueCustomers[customer['id'].toString()] = customer;
          }
          _availableCustomers = uniqueCustomers.values.toList();
          await _cacheData(_customersCacheKey, _availableCustomers);
        } else {
          throw Exception('Invalid response format: Expected a list of customers');
        }
      } else if (response.statusCode == 401) {
        throw Exception('Session expired. Please log in again.');
      } else if (response.statusCode == 500) {
        throw Exception('Server error: Unable to fetch customers. Please contact support.');
      } else {
        throw Exception('Failed to load customers. Status: ${response.statusCode}');
      }
    } catch (e) {
      _showError(null, 'Failed to fetch customers: $e');
      rethrow;
    }
  }

  Future<void> _fetchProducts(String token) async {
    _isLoadingProducts = true;
    notifyListeners();
    try {
      final response = await http.get(
        Uri.parse(getAllProducts),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token', 'Cache-Control': 'no-cache'},
      );

      print('API Request: GET $getAllProducts');
      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final productList = data['data'] is List ? data['data'] : data['services'] is List ? data['services'] : [];
        if (productList is List) {
          _availableProducts = List<Map<String, dynamic>>.from(productList)
              .where((product) => product['service_id']?.toString().isNotEmpty == true)
              .toList();
          await _cacheData(_productsCacheKey, _availableProducts);
        } else {
          throw Exception('Invalid response format: Expected a list of products');
        }
      } else if (response.statusCode == 401) {
        throw Exception('Session expired. Please log in again.');
      } else if (response.statusCode == 500) {
        throw Exception('Server error: Unable to fetch products. Please contact support.');
      } else {
        throw Exception('Failed to load products. Status: ${response.statusCode}');
      }
    } catch (e) {
      _showError(null, 'Failed to fetch products: $e');
      rethrow;
    }
  }

  Future<bool> _apiRequest(BuildContext context, String endpoint, Map<String, dynamic> data, {bool isUpdate = false}) async {
    final token = await _getToken();
    final uri = isUpdate ? Uri.parse('$updateQuotationApi/$_quotationId') : Uri.parse(createQuotationApi);

    print('API Request: ${isUpdate ? 'PUT' : 'POST'} $uri');
    print('Request Headers: {"Content-Type": "application/json", "Authorization": "Bearer $token"}');
    print('Request Body: ${json.encode(data)}');

    try {
      final response = isUpdate
          ? await http.put(
              uri,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer $token',
              },
              body: json.encode(data),
            ).timeout(_httpTimeout)
          : await http.post(
              uri,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer $token',
              },
              body: json.encode(data),
            ).timeout(_httpTimeout);

      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');

      Map<String, dynamic> responseData;
      try {
        responseData = json.decode(response.body);
      } catch (e) {
        print('Network error: Failed to parse response as JSON - $e');
        _showError(context, 'Server error: Invalid response format');
        _logError('Server error: Invalid response format');
        return false;
      }

      final isSuccess = responseData['status'] == true ||
          (responseData['message']?.toString().toLowerCase().contains(isUpdate ? 'updated successfully' : 'created successfully') ?? false);

      if (response.statusCode == 200 && isSuccess) {
        if (!isUpdate && responseData['data']?['id'] != null) {
          _quotationId = responseData['data']['id'].toString();
        }
        return true;
      } else {
        final errorMsg = responseData['error'] ?? responseData['message'] ?? 'Unknown error';
        _showError(context, 'Failed to ${isUpdate ? 'update' : 'create'} quotation: $errorMsg');
        _logError('Failed to ${isUpdate ? 'update' : 'create'} quotation: $errorMsg');
        if (response.statusCode == 401) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove('auth_token');
          if (context.mounted) context.go('/login');
          return false;
        }
        return false;
      }
    } catch (e) {
      print('Network error: $e');
      _showError(context, 'Network error: Unable to ${isUpdate ? 'update' : 'create'} quotation');
      _logError('Network error: Unable to ${isUpdate ? 'update' : 'create'} quotation');
      return false;
    }
  }

  void calculateAmount() {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 100), () {
      try {
        final qty = double.parse(_quantity.trim());
        final unitPrice = double.parse(_price.trim());
        final discountVal = double.parse(_discount.trim());
        _amount = (qty > 0 && unitPrice >= 0 && discountVal >= 0 && discountVal <= 100)
            ? ((qty * unitPrice) * (1 - discountVal / 100)).toStringAsFixed(2)
            : '0.00';
      } catch (_) {
        _amount = '0.00';
      }
      notifyListeners();
    });
  }

  void addProduct(GlobalKey<FormState> formKey, BuildContext context) {
    if (!formKey.currentState!.validate() || _selectedProduct == null) {
      if (_selectedProduct == null) _showError(context, 'Please select a product');
      return;
    }

    final productDetails = _availableProducts.firstWhereOrNull((prod) => prod['service_id'].toString() == _selectedProduct);
    if (productDetails == null) {
      _showError(context, 'Selected product not found');
      return;
    }

    final existingProductIndex = _selectedProducts.indexWhere((item) => item['service_id'] == _selectedProduct);
    if (existingProductIndex != -1) {
      final existingQty = double.parse(_selectedProducts[existingProductIndex]['qty']);
      final newQty = double.parse(_quantity) + existingQty;
      _selectedProducts[existingProductIndex]
        ..['qty'] = newQty.toString()
        ..['amount'] = (newQty * double.parse(_selectedProducts[existingProductIndex]['price']) *
                (1 - double.parse(_selectedProducts[existingProductIndex]['discount']) / 100))
            .toStringAsFixed(2);
      _showSuccess(context, 'Product quantity updated');
    } else {
      _selectedProducts.add({
        'service_id': _selectedProduct,
        'service_name': productDetails['service_name'] ?? 'Unknown Product',
        'qty': _quantity.trim(),
        'price': _price.trim(),
        'discount': _discount.trim(),
        'amount': _amount.trim(),
      });
      _showSuccess(context, 'Product added successfully');
    }

    _resetProductForm();
    notifyListeners();
  }

  void _resetProductForm() {
    _selectedProduct = null;
    _quantity = '1';
    _discount = '0';
    _price = '0';
    _amount = '0';
    notifyListeners();
  }

  void removeProduct(int index, BuildContext context) {
    if (index >= 0 && index < _selectedProducts.length) {
      _selectedProducts.removeAt(index);
      _showSuccess(context, 'Product removed');
      notifyListeners();
    }
  }

  double getTotalAmount() =>
      _selectedProducts.fold(0.0, (sum, item) => sum + (double.tryParse(item['amount']?.toString() ?? '0') ?? 0));

  Future<void> submitQuotation(BuildContext context) async {
    if (_selectedCustomer == null) {
      _showError(context, 'Please select a customer');
      return;
    }
    if (_selectedProducts.isEmpty) {
      _showError(context, 'Please add at least one product');
      return;
    }

    _isSubmitting = true;
    notifyListeners();

    final data = {
      'lead_id': _selectedCustomer,
      'customer_name': _customerName ?? 'Unknown Customer',
      'created_at': _date,
      'products': _selectedProducts
          .map((product) => {
                'id': product['service_id'],
                'quantity': product['qty'],
                'unit_price': product['price'],
                'discount_percentage': product['discount'],
                'total': product['amount'],
              })
          .toList(),
      'total_amount': getTotalAmount().toString(),
      if (_quotationId != null) 'quotation_id': _quotationId,
    };

    final isUpdate = _quotationId != null;
    final endpoint = isUpdate ? updateQuotationApi : createQuotationApi;
    final success = await _apiRequest(context, endpoint, data, isUpdate: isUpdate);

    if (success) {
      _showSuccess(context, 'Quotation ${isUpdate ? 'updated' : 'created'} successfully!');
      _clearForm();
      context.go('/all_quotation');
    }

    _isSubmitting = false;
    notifyListeners();
  }

  Future<void> generatePDF(BuildContext context) async {
    if (_selectedCustomer == null || _selectedProducts.isEmpty) {
      _showError(context, _selectedCustomer == null ? 'Please select a customer' : 'Please add at least one product');
      return;
    }

    _isSubmitting = true;
    notifyListeners();

    try {
      final customer = _availableCustomers.firstWhereOrNull((c) => c['id'].toString() == _selectedCustomer);
      final filePath = await QuotationPDF.generate(
        customerName: _customerName ?? 'Unknown Customer',
        customerAddress: customer?['address'] ?? 'No Address',
        customerEmail: customer?['email'] ?? 'No Email',
        customerPhone: customer?['phone'] ?? 'No Phone',
        selectedProducts: _selectedProducts,
        totalAmount: getTotalAmount(),
        companyLogoPath: 'assets/images/logo.png',
        stampPath: 'assets/images/stamp.png',
        qrCodePath: 'assets/images/qr_code.png',
      );

      if (filePath != null && (await OpenFilex.open(filePath)).type == ResultType.done) {
        _showSuccess(context, 'PDF generated and opened successfully!');
      } else {
        _showError(context, filePath == null ? 'Failed to generate PDF' : 'Failed to open PDF');
      }
    }
     catch (e) {_showError(context, 'Failed to generate PDF: ${e.toString()}'); }
     finally { _isSubmitting = false;notifyListeners(); }
  }

  void _clearForm() {
    _quotationId = null;
    _selectedCustomer = null;
    _customerName = null;
    _selectedProducts.clear();
    _date = DateFormat('yyyy-MM-dd').format(DateTime.now());
    _resetProductForm();
    notifyListeners();
  }

  void _showError(BuildContext? context, String message) {
    if (context != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red.shade600,
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(
            label: 'Dismiss',
            textColor: Colors.white,
            onPressed: () => ScaffoldMessenger.of(context).hideCurrentSnackBar(),
          ),
        ),
      );
    }
    print('Error: $message');
  }

  void _logError(String message) { print('Error: $message'); }

  void _showSuccess(BuildContext context, String message) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green.shade600,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void setSelectedCustomer(String? value, BuildContext context) {
    if (value != null) {
      final customer = _availableCustomers.firstWhereOrNull((c) => c['id'].toString() == value);
      _selectedCustomer = value;
      _customerName = customer?['name']?.toString() ?? 'Unknown Customer';
      notifyListeners();
    }
  }

  void setSelectedProduct(String? value) {
    if (value != null) {
      final product = _availableProducts.firstWhereOrNull((prod) => prod['service_id']?.toString() == value);
      _selectedProduct = value;
      _price = product?['service_price']?.toString() ?? '0';
      calculateAmount();
      notifyListeners();
    }
  }

  void setDate(DateTime date) { _date = DateFormat('yyyy-MM-dd').format(date);notifyListeners();}
  void setQuantity(String value) { _quantity = value;calculateAmount(); notifyListeners(); }
  void setDiscount(String value) { _discount = value; calculateAmount(); notifyListeners(); }

  @override
  void dispose() { _debounceTimer?.cancel(); super.dispose();}
}

class QuotationScreen extends StatelessWidget {
  final String? quotationId;

  const QuotationScreen({super.key, this.quotationId});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => QuotationState()..initialize().then((_) {
            if (quotationId != null) {
              return context.read<QuotationState>().loadQuotation(quotationId!);
            }
          }),
      child: _QuotationScreenContent(quotationId: quotationId),
    );
  }
}

class _QuotationScreenContent extends StatefulWidget {
  final String? quotationId;

  const _QuotationScreenContent({this.quotationId});

  @override
  State<_QuotationScreenContent> createState() => _QuotationScreenContentState();
}

class _QuotationScreenContentState extends State<_QuotationScreenContent> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  late final TextEditingController _dateController;
  late final TextEditingController _quantityController;
  late final TextEditingController _discountController;
  late final TextEditingController _priceController;
  late final TextEditingController _amountController;

  @override
  void initState() {
    super.initState();
    final state = Provider.of<QuotationState>(context, listen: false);
    _dateController = TextEditingController(text: state.date);
    _quantityController = TextEditingController(text: state.quantity);
    _discountController = TextEditingController(text: state.discount);
    _priceController = TextEditingController(text: state.price);
    _amountController = TextEditingController(text: state.amount);

    state.addListener(_updateControllers);
  }

  void _updateControllers() {
    final state = Provider.of<QuotationState>(context, listen: false);
    if (mounted) {
      _dateController.text = state.date;
      _quantityController.text = state.quantity;
      _discountController.text = state.discount;
      _priceController.text = state.price;
      _amountController.text = state.amount;
    }
  }

  @override
  void dispose() {
    Provider.of<QuotationState>(context, listen: false).removeListener(_updateControllers);
    _dateController.dispose();
    _quantityController.dispose();
    _discountController.dispose();
    _priceController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<QuotationState>(
      builder: (context, state, _) => Scaffold(
        appBar: AppBar(
          title: Text(widget.quotationId == null ? "Create Quotation" : "Edit Quotation"),
          backgroundColor: Colors.amber,
          centerTitle: true,
          elevation: 4,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black),
            onPressed: () => context.go('/all_quotation'),
          ),
          actions: [
            if (state.selectedProducts.isNotEmpty && !state.isSubmitting)
              IconButton(
                icon: const Icon(Icons.save, color: Colors.black),
                onPressed: () => state.submitQuotation(context),
                tooltip: widget.quotationId == null ? 'Save Quotation' : 'Update Quotation',
              ),
            if (state.isSubmitting || state.isLoadingQuotation)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                  ),
                ),
              ),
          ],
        ),
        body: state.isLoadingQuotation
            ? const Center(child: CircularProgressIndicator())
            : Padding(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildSectionHeader('Customer Information'),
                        _buildCustomerDropdown(context, state),
                        const SizedBox(height: 16),
                        _buildSectionHeader('Quotation Details'),
                        _buildDatePicker(context, state),
                        const SizedBox(height: 16),
                        _buildSectionHeader('Add Products'),
                        _buildProductForm(context, state),
                        const SizedBox(height: 20),
                        _buildActionButtons(context, state),
                        const SizedBox(height: 16),
                        if (state.selectedProducts.isNotEmpty) _buildProductsTable(context, state),
                      ],
                    ),
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildCustomerDropdown(BuildContext context, QuotationState state) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Customer *',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            state.isLoadingCustomers
                ? _buildShimmerDropdown()
                : state.availableCustomers.isEmpty
                    ? Column(
                        children: [
                          const Text(
                            'No customers available. Please try again or contact support.',
                            style: TextStyle(color: Colors.red),
                          ),
                          TextButton(
                            onPressed: () => state.initialize(),
                            child: const Text('Retry'),
                          ),
                        ],
                      )
                    : DropdownButtonFormField<String>(
                        value: state.selectedCustomer,
                        hint: const Text('Select Customer'),
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        ),
                        isExpanded: true,
                        items: state.availableCustomers.map((customer) {
                          final customerId = customer['id'].toString();
                          final customerName = customer['name']?.toString() ?? 'Unknown Customer';
                          return DropdownMenuItem(
                            value: customerId,
                            child: Text(
                              customerName,
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }).toList(),
                        onChanged: (value) => state.setSelectedCustomer(value, context),
                        validator: (value) => value == null ? 'Please select a customer' : null,
                      ),
          ],
        ),
      ),
    );
  }

  Widget _buildDatePicker(BuildContext context, QuotationState state) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text( 'Quotation Date *', style: TextStyle(fontWeight: FontWeight.bold), ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _dateController,
              decoration: const InputDecoration(
                labelText: 'Date',
                border: OutlineInputBorder(),
                suffixIcon: Icon(Icons.calendar_today),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
              ),
              readOnly: true,
              onTap: () async {
                final pickedDate = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime(2000),
                  lastDate: DateTime(2101),
                );
                if (pickedDate != null) { state.setDate(pickedDate);}
              },
              validator: (value) => value?.isEmpty == true ? 'Please select a date' : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductForm(BuildContext context, QuotationState state) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Product *',style: TextStyle(fontWeight: FontWeight.bold), ),
            const SizedBox(height: 8),
            state.isLoadingProducts
                ? _buildShimmerDropdown()
                : state.availableProducts.isEmpty
                    ? Column(
                        children: [
                          const Text(
                            'No products available. Please try again or contact support.',
                            style: TextStyle(color: Colors.red),
                          ),
                          TextButton(
                            onPressed: () => state.initialize(),
                            child: const Text('Retry'),
                          ),
                        ],
                      )
                    : DropdownButtonFormField<String>(
                        value: state.selectedProduct,
                        hint: const Text('Select Product'),
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        ),
                        isExpanded: true,
                        items: state.availableProducts.map((product) {
                          final productId = product['service_id']?.toString() ?? '';
                          final productName = product['service_name']?.toString() ?? 'Unknown Product';
                          return DropdownMenuItem(
                            value: productId,
                            child: Text(
                              productName,
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }).toList(),
                        onChanged: (value) => state.setSelectedProduct(value),
                        validator: (value) => value == null ? 'Please select a product' : null,
                      ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildNumberField(
                    controller: _quantityController,
                    label: 'Quantity *',
                    onChanged: state.setQuantity,
                    validator: (value) {
                      if (value?.trim().isEmpty == true) return 'Quantity is required';
                      final qty = double.tryParse(value ?? '');
                      if (qty == null || qty <= 0) return 'Enter a valid quantity';
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildNumberField( controller: _priceController,label: 'Unit Price',enabled: false, ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildNumberField(
                    controller: _discountController,
                    label: 'Discount %',
                    onChanged: state.setDiscount,
                    validator: (value) {
                      if (value?.trim().isEmpty == true) return 'Discount is required';
                      final discount = double.tryParse(value ?? '');
                      if (discount == null || discount < 0 || discount > 100) {
                        return 'Enter a valid discount (0-100)';
                      }
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildNumberField(controller: _amountController,label: 'Total Amount',enabled: false, ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNumberField({
    required TextEditingController controller,
    required String label,
    bool enabled = true,
    Function(String)? onChanged,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        filled: !enabled,
        fillColor: enabled ? null : Colors.grey.shade100,
      ),
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      enabled: enabled,
      onChanged: onChanged,
      validator: validator,
    );
  }

  Widget _buildActionButtons(BuildContext context, QuotationState state) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            icon: const Icon(Icons.add, color: Colors.black),
            label: const Text(
              'Add Product',
              style: TextStyle(color: Colors.black),
            ),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: Colors.amber,
              disabledBackgroundColor: Colors.grey.shade300,
            ),
            onPressed: state.isSubmitting ? null : () => state.addProduct(_formKey, context),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton.icon(
            icon: const Icon(Icons.picture_as_pdf, color: Colors.white),
            label: const Text( 'Generate PDF',style: TextStyle(color: Colors.white), ),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: Colors.green.shade600,
              disabledBackgroundColor: Colors.grey.shade300,
            ),
            onPressed: state.isSubmitting ? null : () => state.generatePDF(context),
          ),
        ),
      ],
    );
  }

  Widget _buildProductsTable(BuildContext context, QuotationState state) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Selected Products', style: TextStyle(fontWeight: FontWeight.bold),),
                Text(
                  '${state.selectedProducts.length} item(s)',
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columnSpacing: 20,
                dataRowMinHeight: 48,
                dataRowMaxHeight: 64,
                headingRowColor: MaterialStateProperty.all(Colors.blueGrey.shade50),
                columns: const [
                  DataColumn( label: Text( 'Product', style: TextStyle(fontWeight: FontWeight.bold), ), ),
                  DataColumn(label: Text( 'Qty',style: TextStyle(fontWeight: FontWeight.bold), ), ),
                  DataColumn( label: Text( 'Price', style: TextStyle(fontWeight: FontWeight.bold), ), ),
                  DataColumn( label: Text( 'Disc %', style: TextStyle(fontWeight: FontWeight.bold), ), ),
                  DataColumn( label: Text('Amount', style: TextStyle(fontWeight: FontWeight.bold), ),),
                  DataColumn( label: Text( 'Action', style: TextStyle(fontWeight: FontWeight.bold), ), ),
                ],
                rows: [
                  ...state.selectedProducts.asMap().entries.map((entry) {
                    final index = entry.key;
                    final product = entry.value;
                    return DataRow(
                      cells: [
                        DataCell(
                          SizedBox(
                            width: 120, child: Text( product['service_name']?.toString() ?? 'Unknown',overflow: TextOverflow.ellipsis, maxLines: 2, ),
                          ),
                        ),
                        DataCell(
                          Center(child: Text(product['qty']?.toString() ?? '0'), ), ),
                        DataCell(Text('\$${product['price']?.toString() ?? '0'}'), ),
                        DataCell(Center(child: Text('${product['discount']?.toString() ?? '0'}%'),), ),
                        DataCell(Text( '\$${product['amount']?.toString() ?? '0'}',
                            style: const TextStyle(fontWeight: FontWeight.bold),),),
                        DataCell(
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () => state.removeProduct(index, context),
                            tooltip: 'Remove Product',
                          ),
                        ),
                      ],
                    );
                  }),
                  DataRow(
                    color: MaterialStateProperty.all(Colors.amber.shade100),
                    cells: [
                      const DataCell( Text('TOTAL', style: TextStyle( fontWeight: FontWeight.bold, fontSize: 16, ),),
                      ),
                      const DataCell(Text('')),
                      const DataCell(Text('')),
                      const DataCell(Text('')),
                      DataCell(
                        Text(
                          '\$${state.getTotalAmount().toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: Colors.green,
                          ),
                        ),
                      ),
                      const DataCell(Text('')),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  Widget _buildShimmerDropdown() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(4),
        ),
      ),
    );
  }
}