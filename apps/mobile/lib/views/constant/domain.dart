const String _defaultDomain = "https://application-api.etaxwala.com/api/";
final String domain = const String.fromEnvironment('APP_API_URL', defaultValue: _defaultDomain);



final String userLoginApi = "${domain}login";
final String refreshAuthToken = "${domain}refresh";
final String validateAuthToken = "${domain}me";
final String getAllServices = "${domain}get_all_services";
final String getAllLeads = "${domain}get_all_leads";
final String getLeadDetail = "${domain}get_lead_detail";

final String createQuotationApi = "${domain}create_quotation"; // POST
final String updateQuotationApi = "${domain}update_quotation/"; // PUT — append ID dynamically
final String viewQuotationApi = "${domain}quotation/view"; // GET
final String getAllQuotationsApi = "${domain}quotation/all"; // GET

final String getQuotations = "${domain}get_quotations";
final String getAllCustomers = "${domain}get_all_customers";

final String getAllProducts = "${domain}get_all_products";
final String getLeadRemark = "${domain}get_lead_remarks";

// final String addNewLead = "${domain}add_lead";//post
final String updateLead = "${domain}update-lead";//post
final String updateLeadStatus = "${domain}update-lead-status";//post
final String addLeadFollowup = "${domain}add-lead-followup"; //post
final String getFollowupCalls = "${domain}get-followup-calls"; //get
final String AddAppointment = "${domain}new_appointment";//post
final String UpdateAppointment = "${domain}update_appointment";//post
final String getAllAppointmentsApi = "${domain}appointments";
final String getAppointmentByIdApi = "${domain}appointments/";
final String updateProfileu = "${domain}update_profile";


// Route::post('new_appointment', [LeadController::class, 'AddAppointment']);
// Route::post('update_appointment', [LeadController::class, 'UpdateAppointment']);
// Route::post('update_profile', [LeadController::class, 'updateProfile']);
//  Route::post('/create_quotation', [QuotationController::class, 'store']);
// Route::put('/update_quotation/{id}', [QuotationController::class, 'update']);
// Route::get('appointments', [LeadController::class, 'GetAllAppointments']);
    // Get a single appointment by ID
    // Route::get('appointments/{id}', [LeadController::class, 'GetAppointment']);