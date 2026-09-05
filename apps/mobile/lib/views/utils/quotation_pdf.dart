import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:flutter/services.dart' show ByteData, Uint8List, rootBundle;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:intl/intl.dart';

class QuotationPDF {
  static Future<String?> generate({
    required String customerName,
    required String customerAddress,
    required String customerEmail,
    required String customerPhone,
    required List<Map<String, dynamic>> selectedProducts,
    required double totalAmount,
    required String companyLogoPath,
    required String stampPath,
    required String qrCodePath,
  }) async {
    final pdf = pw.Document();

    try {
      // Load assets
      final ByteData logoData = await rootBundle.load(companyLogoPath);
      final Uint8List logoBytes = logoData.buffer.asUint8List();

      final ByteData stampData = await rootBundle.load(stampPath);
      final Uint8List stampBytes = stampData.buffer.asUint8List();

      final ByteData qrCodeData = await rootBundle.load(qrCodePath);
      final Uint8List qrCodeBytes = qrCodeData.buffer.asUint8List();

      // Generate unique quotation number and date
      final String quotationNumber = 'QT${DateTime.now().millisecondsSinceEpoch}';
      final String currentDate = DateFormat('dd-MM-yyyy').format(DateTime.now());

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(20),
          build: (pw.Context context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Header
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Image(pw.MemoryImage(logoBytes), width: 150, height: 100),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text(
                          "Quotation",
                          style: pw.TextStyle(
                            fontSize: 24,
                            fontWeight: pw.FontWeight.bold,
                          ),
                        ),
                        pw.Text("Quotation #$quotationNumber"),
                        pw.Text("Date: $currentDate"),
                      ],
                    ),
                  ],
                ),
                pw.SizedBox(height: 20),

                // Address Section
                pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    _buildAddressSection(
                      title: "From",
                      name: "ETaxwala Business Solution Pvt Ltd",
                      address: "150, Jalna Road, Ambad, Maharashtra 431204",
                      email: "support@etaxwala.com",
                      phone: "+91 70710 70707 / 94206 73568",
                      website: "https://etaxwala.com/",
                    ),
                    pw.SizedBox(width: 20),
                    _buildAddressSection(
                      title: "To",
                      name: customerName,
                      address: customerAddress,
                      email: customerEmail,
                      phone: customerPhone,
                      website: "",
                    ),
                  ],
                ),
                pw.SizedBox(height: 20),

                // Product Table
                _buildProductTable(selectedProducts),
                pw.SizedBox(height: 10),

                // Total Amount
                _buildTotalAmountSection(totalAmount),
                pw.SizedBox(height: 20),

                // Signature Section
                _buildSignatureSection(stampBytes),
                pw.SizedBox(height: 20),

                // Payment Terms and Bank Details
                pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    _buildPaymentTerms(),
                    pw.SizedBox(width: 20),
                    _buildBankDetails(qrCodeBytes),
                  ],
                ),
              ],
            );
          },
        ),
      );

      // Request storage permission
      final status = await Permission.storage.request();
      if (status.isGranted) {
        // Get platform-appropriate directory
        final directory = await getDownloadsDirectory();
        if (directory == null) {
          print("❌ Unable to access downloads directory");
          return null;
        }

        // Create unique filename
        final filePath = '${directory.path}/quotation_$quotationNumber.pdf';
        final file = File(filePath);

        // Save PDF
        await file.writeAsBytes(await pdf.save());
        print("✅ PDF saved at: $filePath");
        return filePath;
      } else {
        print("❌ Storage permission denied");
        return null;
      }
    } catch (e) {
      print("❌ Error generating PDF: $e");
      return null;
    }
  }

  static pw.Widget _buildAddressSection({
    required String title,
    required String name,
    required String address,
    required String email,
    required String phone,
    required String website,
  }) {
    return pw.Expanded(
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            title,
            style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
          ),
          pw.Text(name),
          pw.Text(address),
          pw.Text("Email: $email"),
          pw.Text("Phone: $phone"),
          if (website.isNotEmpty) pw.Text("Website: $website"),
        ],
      ),
    );
  }

  static pw.Widget _buildProductTable(List<Map<String, dynamic>> selectedProducts) {
    return pw.Table(
      border: pw.TableBorder.all(),
      columnWidths: {
        0: pw.FlexColumnWidth(2), // Service
        1: pw.FlexColumnWidth(1), // Quantity
        2: pw.FlexColumnWidth(1), // Price
        3: pw.FlexColumnWidth(1), // Discount
        4: pw.FlexColumnWidth(1), // Amount
      },
      children: [
        pw.TableRow(
          decoration: pw.BoxDecoration(color: PdfColors.grey300),
          children: [
            "Service",
            "Qty",
            "Price",
            "Disc %",
            "Amount",
          ].map((text) => pw.Padding(
                padding: const pw.EdgeInsets.all(8),
                child: pw.Text(
                  text,
                  style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
                ),
              )).toList(),
        ),
        ...selectedProducts.map((product) => pw.TableRow(
              children: [
                pw.Padding(
                  padding: const pw.EdgeInsets.all(8),
                  child: pw.Text(product['service_name'] ?? 'Unknown'),
                ),
                pw.Padding(
                  padding: const pw.EdgeInsets.all(8),
                  child: pw.Text(product['qty']?.toString() ?? '0'),
                ),
                pw.Padding(
                  padding: const pw.EdgeInsets.all(8),
                  child: pw.Text('\$${product['price']?.toString() ?? '0'}'),
                ),
                pw.Padding(
                  padding: const pw.EdgeInsets.all(8),
                  child: pw.Text('${product['discount']?.toString() ?? '0'}%'),
                ),
                pw.Padding(
                  padding: const pw.EdgeInsets.all(8),
                  child: pw.Text('\$${product['amount']?.toString() ?? '0'}'),
                ),
              ],
            )),
      ],
    );
  }

  static pw.Widget _buildTotalAmountSection(double total) {
    return pw.Row(
      mainAxisAlignment: pw.MainAxisAlignment.end,
      children: [
        pw.Text(
          "Total: \$${total.toStringAsFixed(2)}",
          style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
        ),
      ],
    );
  }

  static pw.Widget _buildSignatureSection(Uint8List stampBytes) {
    return pw.Row(
      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
      children: [
        pw.Column(
          children: [
            pw.Text("Customer Seal & Signature"),
            pw.Container(width: 150, height: 100),
          ],
        ),
        pw.Column(
          children: [
            pw.Text("Company Seal & Signature"),
            pw.Image(pw.MemoryImage(stampBytes), width: 150, height: 100),
          ],
        ),
      ],
    );
  }

  static pw.Widget _buildPaymentTerms() {
    return pw.Expanded(
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            "Payment Terms & Conditions",
            style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
          ),
          pw.Bullet(text: "Quotation valid for 30 days."),
          pw.Bullet(text: "50% deposit required to confirm order."),
          pw.Bullet(text: "Late payments incur 1.5% per month fee."),
          pw.Bullet(text: "Non-payment leads to account suspension."),
          pw.Bullet(text: "Taxes and other charges are extra."),
        ],
      ),
    );
  }

  static pw.Widget _buildBankDetails(Uint8List qrCodeBytes) {
    return pw.Expanded(
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            "Bank Details",
            style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
          ),
          pw.Text("Bank: ICICI Bank"),
          pw.Text("Account No: 200805008777"),
          pw.Text("Account Holder: ETaxwala Business Solution Pvt Ltd"),
          pw.Text("IFSC Code: ICIC0002008"),
          pw.Text("Branch: Ambad"),
          pw.Text("UPI ID: etaxwala@icici"),
          pw.Image(pw.MemoryImage(qrCodeBytes), width: 150, height: 100),
        ],
      ),
    );
  }
}