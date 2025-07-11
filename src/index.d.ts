import { Utils as HapiUtil, Server } from '@hapi/hapi'
import { ILogger } from '@mojaloop/central-services-logger/src/contextLogger'
import { Knex } from 'knex';
import IORedis from 'ioredis';

declare namespace CentralServicesShared {
  interface ReturnCode {
    CODE: number;
    DESCRIPTION: string;
  }
  interface HttpEnum {
    Headers: {
      FSPIOP: {
        SOURCE: string;
        DESTINATION: string;
        PROXY: string;
        HTTP_METHOD: string;
        SIGNATURE: string;
        URI: string;
      };
    };
    HeaderResources: {
      PARTICIPANTS: string;
      ORACLE: string;
      TRANSFERS: string;
      FX_TRANSFERS: string;
      QUOTES: string;
      FX_QUOTES: string;
      PARTIES: string;
    };
    ReturnCodes: {
      OK: ReturnCode;
      ACCEPTED: ReturnCode;
    };
    RestMethods: {
      GET: RestMethodsEnum.GET;
      POST: RestMethodsEnum.POST;
      PUT: RestMethodsEnum.PUT;
      DELETE: RestMethodsEnum.DELETE;
      PATCH: RestMethodsEnum.PATCH;
    };
    ResponseTypes: {
      JSON: string;
    };
  }
  enum RestMethodsEnum {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH'
  }
  enum FspEndpointTypesEnum {
    FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE = 'FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE',
    FSPIOP_CALLBACK_URL = 'FSPIOP_CALLBACK_URL',
    FSPIOP_CALLBACK_URL_PARTICIPANT_PUT = 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT',
    FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR',
    FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT = 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT',
    FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR',
    FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE = 'FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE',
    FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE = 'FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE',
    FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT = 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT',
    FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR',
    FSPIOP_CALLBACK_URL_PARTIES_GET = 'FSPIOP_CALLBACK_URL_PARTIES_GET',
    FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET = 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET',
    FSPIOP_CALLBACK_URL_PARTIES_PUT = 'FSPIOP_CALLBACK_URL_PARTIES_PUT',
    FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT = 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT',
    FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR',
    FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR = 'FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR',
    FSPIOP_CALLBACK_URL_TRANSFER_POST = 'FSPIOP_CALLBACK_URL_TRANSFER_POST',
    FSPIOP_CALLBACK_URL_TRANSFER_PUT = 'FSPIOP_CALLBACK_URL_TRANSFER_PUT',
    FSPIOP_CALLBACK_URL_TRANSFER_ERROR = 'FSPIOP_CALLBACK_URL_TRANSFER_ERROR',
    FSPIOP_CALLBACK_URL_FX_TRANSFER_POST = 'FSPIOP_CALLBACK_URL_FX_TRANSFER_POST',
    FSPIOP_CALLBACK_URL_FX_TRANSFER_PUT = 'FSPIOP_CALLBACK_URL_FX_TRANSFER_PUT',
    FSPIOP_CALLBACK_URL_FX_TRANSFER_ERROR = 'FSPIOP_CALLBACK_URL_FX_TRANSFER_ERROR',
    ALARM_NOTIFICATION_URL = 'ALARM_NOTIFICATION_URL',
    ALARM_NOTIFICATION_TOPIC = 'ALARM_NOTIFICATION_TOPIC',
    NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL = 'NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL',
    NET_DEBIT_CAP_ADJUSTMENT_EMAIL = 'NET_DEBIT_CAP_ADJUSTMENT_EMAIL',
    SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL = 'SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL',
    FSPIOP_CALLBACK_URL_QUOTES = 'FSPIOP_CALLBACK_URL_QUOTES',
    FSPIOP_CALLBACK_URL_FX_QUOTES = 'FSPIOP_CALLBACK_URL_FX_QUOTES',
    FSPIOP_CALLBACK_URL_BULK_QUOTES = 'FSPIOP_CALLBACK_URL_BULK_QUOTES',
    FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST = 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST',
    FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT = 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT',
    FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR = 'FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR',
    FSPIOP_CALLBACK_URL_AUTHORIZATIONS = 'FSPIOP_CALLBACK_URL_AUTHORIZATIONS',
    TP_CB_URL_TRANSACTION_REQUEST_GET = 'TP_CB_URL_TRANSACTION_REQUEST_GET',
    TP_CB_URL_TRANSACTION_REQUEST_POST = 'TP_CB_URL_TRANSACTION_REQUEST_POST',
    TP_CB_URL_TRANSACTION_REQUEST_PUT = 'TP_CB_URL_TRANSACTION_REQUEST_PUT',
    TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR = 'TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR',
    TP_CB_URL_TRANSACTION_REQUEST_PATCH = 'TP_CB_URL_TRANSACTION_REQUEST_PATCH',
    TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST = 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST',
    TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT = 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT',
    TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR = 'TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR',
    TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST = 'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST',
    TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT = 'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT',
    TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR = 'TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR',
    TP_CB_URL_CONSENT_REQUEST_PATCH = 'TP_CB_URL_CONSENT_REQUEST_PATCH',
    TP_CB_URL_CONSENT_REQUEST_POST = 'TP_CB_URL_CONSENT_REQUEST_POST',
    TP_CB_URL_CONSENT_REQUEST_PUT = 'TP_CB_URL_CONSENT_REQUEST_PUT',
    TP_CB_URL_CONSENT_REQUEST_PUT_ERROR = 'TP_CB_URL_CONSENT_REQUEST_PUT_ERROR',
    TP_CB_URL_CREATE_CREDENTIAL_POST = 'TP_CB_URL_CREATE_CREDENTIAL_POST',
    TP_CB_URL_CONSENT_POST = 'TP_CB_URL_CONSENT_POST',
    TP_CB_URL_CONSENT_GET = 'TP_CB_URL_CONSENT_GET',
    TP_CB_URL_CONSENT_PUT = 'TP_CB_URL_CONSENT_PUT',
    TP_CB_URL_CONSENT_PATCH = 'TP_CB_URL_CONSENT_PATCH',
    TP_CB_URL_CONSENT_PUT_ERROR = 'TP_CB_URL_CONSENT_PUT_ERROR',
    TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST = 'TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST',
    TP_CB_URL_CONSENT_GENERATE_CHALLENGE_PUT_ERROR = 'TP_CB_URL_CONSENT_GENERATE_CHALLENGE_PUT_ERROR',
    TP_CB_URL_ACCOUNTS_GET = 'TP_CB_URL_ACCOUNTS_GET',
    TP_CB_URL_ACCOUNTS_PUT = 'TP_CB_URL_ACCOUNTS_PUT',
    TP_CB_URL_ACCOUNTS_PUT_ERROR = 'TP_CB_URL_ACCOUNTS_PUT_ERROR',
    TP_CB_URL_SERVICES_GET = 'TP_CB_URL_SERVICES_GET',
    TP_CB_URL_SERVICES_PUT = 'TP_CB_URL_SERVICES_PUT',
    TP_CB_URL_SERVICES_PUT_ERROR = 'TP_CB_URL_SERVICES_PUT_ERROR',
  }
  interface EndPointsEnum {
    EndpointType: {
      ALARM_NOTIFICATION_URL: number;
      ALARM_NOTIFICATION_TOPIC: number;
      FSPIOP_CALLBACK_URL_TRANSFER_POST: number;
      FSPIOP_CALLBACK_URL_TRANSFER_PUT: number;
      FSPIOP_CALLBACK_URL_TRANSFER_ERROR: number;
    };
    FspEndpointTypes: {
      FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE;
      FSPIOP_CALLBACK_URL: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL;
      FSPIOP_CALLBACK_URL_PARTICIPANT_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_PUT;
      FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR;
      FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT;
      FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_PUT_ERROR;
      FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_DELETE;
      FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_SUB_ID_DELETE;
      FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT;
      FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR;
      FSPIOP_CALLBACK_URL_PARTIES_GET: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_GET;
      FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_GET;
      FSPIOP_CALLBACK_URL_PARTIES_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_PUT;
      FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT;
      FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR;
      FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_PARTIES_SUB_ID_PUT_ERROR;
      FSPIOP_CALLBACK_URL_FX_TRANSFER_POST: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_FX_TRANSFER_POST;
      FSPIOP_CALLBACK_URL_FX_TRANSFER_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_FX_TRANSFER_PUT;
      FSPIOP_CALLBACK_URL_FX_TRANSFER_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_FX_TRANSFER_ERROR;
      FSPIOP_CALLBACK_URL_TRANSFER_POST: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_TRANSFER_POST;
      FSPIOP_CALLBACK_URL_TRANSFER_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_TRANSFER_PUT;
      FSPIOP_CALLBACK_URL_TRANSFER_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_TRANSFER_ERROR;
      ALARM_NOTIFICATION_URL: FspEndpointTypesEnum.ALARM_NOTIFICATION_URL;
      ALARM_NOTIFICATION_TOPIC: FspEndpointTypesEnum.ALARM_NOTIFICATION_TOPIC;
      NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL: FspEndpointTypesEnum.NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL;
      NET_DEBIT_CAP_ADJUSTMENT_EMAIL: FspEndpointTypesEnum.NET_DEBIT_CAP_ADJUSTMENT_EMAIL;
      SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL: FspEndpointTypesEnum.SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL;
      FSPIOP_CALLBACK_URL_QUOTES: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_QUOTES;
      FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_BULK_TRANSFER_POST;
      FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_BULK_TRANSFER_PUT;
      FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_BULK_TRANSFER_ERROR;
      FSPIOP_CALLBACK_URL_AUTHORIZATIONS: FspEndpointTypesEnum.FSPIOP_CALLBACK_URL_AUTHORIZATIONS;
      TP_CB_URL_TRANSACTION_REQUEST_GET: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_GET;
      TP_CB_URL_TRANSACTION_REQUEST_POST: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_POST;
      TP_CB_URL_TRANSACTION_REQUEST_PUT: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_PUT;
      TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_PUT_ERROR;
      TP_CB_URL_TRANSACTION_REQUEST_PATCH: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_PATCH;
      TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_AUTH_POST;
      TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT;
      TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_AUTH_PUT_ERROR;
      TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_POST;
      TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT;
      TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_TRANSACTION_REQUEST_VERIFY_PUT_ERROR;
      TP_CB_URL_CONSENT_REQUEST_PATCH: FspEndpointTypesEnum.TP_CB_URL_CONSENT_REQUEST_PATCH;
      TP_CB_URL_CONSENT_REQUEST_POST: FspEndpointTypesEnum.TP_CB_URL_CONSENT_REQUEST_POST;
      TP_CB_URL_CONSENT_REQUEST_PUT: FspEndpointTypesEnum.TP_CB_URL_CONSENT_REQUEST_PUT;
      TP_CB_URL_CONSENT_REQUEST_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_CONSENT_REQUEST_PUT_ERROR;
      TP_CB_URL_CREATE_CREDENTIAL_POST: FspEndpointTypesEnum.TP_CB_URL_CREATE_CREDENTIAL_POST;
      TP_CB_URL_CONSENT_POST: FspEndpointTypesEnum.TP_CB_URL_CONSENT_POST;
      TP_CB_URL_CONSENT_GET: FspEndpointTypesEnum.TP_CB_URL_CONSENT_GET;
      TP_CB_URL_CONSENT_PUT: FspEndpointTypesEnum.TP_CB_URL_CONSENT_PUT;
      TP_CB_URL_CONSENT_PATCH: FspEndpointTypesEnum.TP_CB_URL_CONSENT_PATCH;
      TP_CB_URL_CONSENT_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_CONSENT_PUT_ERROR;
      TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST: FspEndpointTypesEnum.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_POST;
      TP_CB_URL_CONSENT_GENERATE_CHALLENGE_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_CONSENT_GENERATE_CHALLENGE_PUT_ERROR;
      TP_CB_URL_ACCOUNTS_GET: FspEndpointTypesEnum.TP_CB_URL_ACCOUNTS_GET;
      TP_CB_URL_ACCOUNTS_PUT: FspEndpointTypesEnum.TP_CB_URL_ACCOUNTS_PUT;
      TP_CB_URL_ACCOUNTS_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_ACCOUNTS_PUT_ERROR;
      TP_CB_URL_SERVICES_GET: FspEndpointTypesEnum.TP_CB_URL_SERVICES_GET;
      TP_CB_URL_SERVICES_PUT: FspEndpointTypesEnum.TP_CB_URL_SERVICES_PUT;
      TP_CB_URL_SERVICES_PUT_ERROR: FspEndpointTypesEnum.TP_CB_URL_SERVICES_PUT_ERROR;
    };
    FspEndpointTemplates: {
      TRANSACTION_REQUEST_POST: string;
      TRANSACTION_REQUEST_PUT: string;
      TRANSACTION_REQUEST_GET: string;
      TRANSACTION_REQUEST_PUT_ERROR: string;
      PARTICIPANT_ENDPOINTS_GET: string;
      PARTICIPANTS_GET: string;
      PARTICIPANTS_POST: string;
      PARTIES_GET: string;
      PARTIES_PUT_ERROR: string;
      PARTIES_SUB_ID_PUT_ERROR: string;
      ORACLE_PARTICIPANTS_TYPE_ID: string;
      ORACLE_PARTICIPANTS_TYPE_ID_CURRENCY: string;
      ORACLE_PARTICIPANTS_TYPE_ID_SUB_ID: string;
      ORACLE_PARTICIPANTS_TYPE_ID_CURRENCY_SUB_ID: string;
      ORACLE_PARTICIPANTS_BATCH: string;
      FX_TRANSFERS_POST: string;
      FX_TRANSFERS_PUT: string;
      FX_TRANSFERS_PUT_ERROR: string;
      FX_QUOTES_POST: string;
      FX_QUOTES_PUT: string;
      FX_QUOTES_ERROR_PUT: string;
      TRANSFERS_POST: string;
      TRANSFERS_PUT: string;
      TRANSFERS_PUT_ERROR: string;
      BULK_TRANSFERS_POST: string;
      BULK_TRANSFERS_PUT: string;
      BULK_TRANSFERS_PUT_ERROR: string;
      BULK_QUOTES_POST: string;
      BULK_QUOTES_ERROR_PUT: string;
      TP_TRANSACTION_REQUEST_GET: string;
      TP_TRANSACTION_REQUEST_POST: string;
      TP_TRANSACTION_REQUEST_PUT: string;
      TP_TRANSACTION_REQUEST_PUT_ERROR: string;
      TP_TRANSACTION_REQUEST_PATCH: string;
      TP_REQUESTS_AUTHORIZATIONS_POST: string;
      TP_REQUESTS_AUTHORIZATIONS_PUT: string;
      TP_REQUESTS_AUTHORIZATIONS_PUT_ERROR: string;
      TP_REQUESTS_VERIFICATIONS_POST: string;
      TP_REQUESTS_VERIFICATIONS_PUT: string;
      TP_REQUESTS_VERIFICATIONS_PUT_ERROR: string;
      TP_CONSENT_REQUEST_PATCH: string;
      TP_CONSENT_REQUEST_POST: string;
      TP_CONSENT_REQUEST_PUT: string;
      TP_CONSENT_REQUEST_PUT_ERROR: string;
      TP_CONSENT_CREATE_CREDENTIAL_POST: string;
      TP_CONSENT_POST: string;
      TP_CONSENT_GET: string;
      TP_CONSENT_PUT: string;
      TP_CONSENT_PATCH: string;
      TP_CONSENT_PUT_ERROR: string;
      TP_CONSENT_GENERATE_CHALLENGE_POST: string;
      TP_CONSENT_GENERATE_CHALLENGE_PUT_ERROR: string;
      TP_ACCOUNTS_GET: string;
      TP_ACCOUNTS_PUT: string;
      TP_ACCOUNTS_PUT_ERROR: string;
      TP_SERVICES_GET: string;
      TP_SERVICES_PUT: string;
      TP_SERVICES_PUT_ERROR: string;
    };
  }

  enum KakfaConfigEnum {
    CONSUMER = 'CONSUMER',
    PRODUCER = 'PRODUCER'
  }

  enum EventTypeEnum {
    ADMIN = 'admin',
    AUTHORIZATION = 'authorization',
    ACCOUNT = 'account',
    BULK = 'bulk',
    BULK_QUOTE = 'bulkquote',
    BULK_PROCESSING = 'bulk-processing',
    BULK_PREPARE = 'bulk-prepare',
    BULK_FULFIL = 'bulk-fulfil',
    CONSENT = 'consent',
    CONSENT_REQUEST = 'consent-request',
    ENDPOINTCACHE = 'endpointcache',
    EVENT = 'event',
    FULFIL = 'fulfil',
    FX_QUOTE = 'fxquote',
    FX_TRANSFER = 'fxtransfer',
    GET = 'get',
    NOTIFICATION = 'notification',
    ORACLE = 'oracle',
    POSITION = 'position',
    PREPARE = 'prepare',
    QUOTE = 'quote',
    SERVICE = 'service',
    SETTLEMENT = 'settlement',
    SETTLEMENT_WINDOW = 'settlementwindow',
    THIRDPARTY = 'thirdparty',
    TRANSACTION_REQUEST = 'transaction-request',
    TRANSFER = 'transfer',
    PARTY = 'party',
    PARTICIPANT = 'participant',
    DEFERRED_SETTLEMENT = 'deferred-settlement',
    GROSS_SETTLEMENT = 'gross-settlement',
    VERIFICATION = 'verification'
  }

  enum EventActionEnum {
    ABORT = 'abort',
    ABORT_DUPLICATE = 'abort-duplicate',
    ABORT_VALIDATION = 'abort-validation',
    ACCEPT = 'accept',
    BULK_ABORT = 'bulk-abort',
    BULK_COMMIT = 'bulk-commit',
    BULK_PREPARE = 'bulk-prepare',
    BULK_PROCESSING = 'bulk-processing',
    BULK_TIMEOUT_RECEIVED = 'bulk-timeout-received',
    BULK_TIMEOUT_RESERVED = 'bulk-timeout-reserved',
    BULK_PREPARE_DUPLICATE = 'bulk-prepare-duplicate',
    BULK_GET = 'bulk-get',
    CLOSE = 'close',
    COMMIT = 'commit',
    CREATE = 'create',
    DELETE = 'delete',
    EVENT = 'event',
    FAIL = 'fail',
    FULFIL = 'fulfil',
    FULFIL_DUPLICATE = 'fulfil-duplicate',
    FX_FULFIL = 'fx-fulfil',
    FX_ABORT = 'fx-abort',
    FX_COMMIT = 'fx-commit',
    FX_PREPARE = 'fx-prepare',
    FX_REJECT = 'fx-reject',
    FX_RESERVE = 'fx-reserve',
    FX_PREPARE_DUPLICATE = 'fx-prepare-duplicate',
    FX_ABORT_VALIDATION = 'fx-abort-validation',
    FX_RESERVED_ABORTED = 'fx-reserved-aborted',
    FX_FORWARDED = 'fx-forwarded',
    FX_FULFIL_DUPLICATE = 'fx-fulfil-duplicate',
    FX_ABORT_DUPLICATE = 'fx-abort-duplicate',
    FX_TIMEOUT_RECEIVED = 'fx-timeout-received',
    FX_TIMEOUT_RESERVED = 'fx-timeout-reserved',
    FX_GET = 'fx-get',
    FX_NOTIFY = 'fx-notify',
    GET = 'get',
    INITIATE = 'initiate',
    LIMIT_ADJUSTMENT = 'limit-adjustment',
    LOOKUP = 'lookup',
    POSITION = 'position',
    POSITION_PREPARE = 'position-prepare',
    POSITION_FULFIL = 'position-fulfil',
    PREPARE = 'prepare',
    FORWARDED = 'forwarded',
    PREPARE_DUPLICATE = 'prepare-duplicate',
    PROCESSING = 'processing',
    RECORD_FUNDS_IN = 'recordFundsIn',
    RECORD_FUNDS_OUT_ABORT = 'recordFundsOutAbort',
    RECORD_FUNDS_OUT_COMMIT = 'recordFundsOutCommit',
    RECORD_FUNDS_OUT_PREPARE_RESERVE = 'recordFundsOutPrepareReserve',
    REJECT = 'reject',
    RESOLVE = 'resolve',
    REQUEST = 'request',
    RESERVE = 'reserve',
    RESERVED_ABORTED = 'reserved-aborted',
    SETTLEMENT_WINDOW = 'settlement-window',
    TIMEOUT_RECEIVED = 'timeout-received',
    TIMEOUT_RESERVED = 'timeout-reserved',
    TRANSFER = 'transfer',
    PATCH = 'patch',
    PUT = 'put',
    POST = 'post'
  }

  enum TransferInternalStateEnum {
    ABORTED_ERROR = 'ABORTED_ERROR',
    ABORTED_REJECTED= 'ABORTED_REJECTED',
    COMMITTED = 'COMMITTED',
    EXPIRED_PREPARED = 'EXPIRED_PREPARED',
    EXPIRED_RESERVED = 'EXPIRED_RESERVED',
    FAILED = 'FAILED',
    INVALID = 'INVALID',
    RECEIVED_ERROR = 'RECEIVED_ERROR',
    RECEIVED_FULFIL = 'RECEIVED_FULFIL',
    RECEIVED_PREPARE = 'RECEIVED_PREPARE',
    RECEIVED_REJECT = 'RECEIVED_REJECT',
    RESERVED = 'RESERVED',
    RESERVED_FORWARDED = 'RESERVED_FORWARDED',
    RESERVED_TIMEOUT = 'RESERVED_TIMEOUT'
  }

  enum TransferStateEnum {
    RECEIVED = 'RECEIVED',
    ABORTED = 'ABORTED',
    COMMITTED = 'COMMITTED',
    RESERVED = 'RESERVED',
    SETTLED = 'SETTLED'
  }

  enum BulkProcessingStateEnum {
    RECEIVED = 1,
    RECEIVED_DUPLICATE = 2,
    RECEIVED_INVALID = 3,
    ACCEPTED = 4,
    PROCESSING = 5,
    FULFIL_DUPLICATE = 6,
    FULFIL_INVALID = 7,
    COMPLETED = 8,
    REJECTED = 9,
    EXPIRED = 10,
    ABORTING = 11
  }

  enum BulkTransferStateEnum {
    ABORTING = 'ABORTING',
    ACCEPTED = 'ACCEPTED',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'EXPIRED',
    EXPIRING = 'EXPIRING',
    INVALID = 'INVALID',
    PENDING_FULFIL = 'PENDING_FULFIL',
    PENDING_INVALID = 'PENDING_INVALID',
    PENDING_PREPARE = 'PENDING_PREPARE',
    PROCESSING = 'PROCESSING',
    RECEIVED = 'RECEIVED',
    REJECTED = 'REJECTED'
  }

  enum BulkTransferStateEnumDeclaration {
    ACCEPTED = 'ACCEPTED',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'COMPLETED',
    EXPIRING = 'PROCESSING',
    INVALID = 'REJECTED',
    PENDING_FULFIL = 'PROCESSING',
    PENDING_INVALID = 'PENDING',
    PENDING_PREPARE = 'PENDING',
    PROCESSING = 'PROCESSING',
    RECEIVED = 'RECEIVED',
    REJECTED = 'REJECTED'
  }

  enum AdminTransferActionEnum {
    RECORD_FUNDS_IN = 'recordFundsIn',
    RECORD_FUNDS_OUT_PREPARE_RESERVE = 'recordFundsOutPrepareReserve',
    RECORD_FUNDS_OUT_COMMIT = 'recordFundsOutCommit',
    RECORD_FUNDS_OUT_ABORT = 'recordFundsOutAbort'
  }

  enum AdminNotificationActionsEnum {
    LIMIT_ADJUSTMENT = 'limit-adjustment'
  }

  interface Enum {
    Http: HttpEnum;
    EndPoints: EndPointsEnum;
    Kafka: {
      Config: {
        CONSUMER: string,
        PRODUCER: string,
      }
    }
    Events: {
      Event: {
        Action: {
          ABORT: EventActionEnum.ABORT;
          ABORT_DUPLICATE: EventActionEnum.ABORT_DUPLICATE;
          ABORT_VALIDATION: EventActionEnum.ABORT_VALIDATION;
          ACCEPT: EventActionEnum.ACCEPT;
          BULK_ABORT: EventActionEnum.BULK_ABORT;
          BULK_COMMIT: EventActionEnum.BULK_COMMIT;
          BULK_PREPARE: EventActionEnum.BULK_PREPARE;
          BULK_PREPARE_DUPLICATE: EventActionEnum.BULK_PREPARE_DUPLICATE;
          BULK_PROCESSING: EventActionEnum.BULK_PROCESSING;
          BULK_TIMEOUT_RECEIVED: EventActionEnum.BULK_TIMEOUT_RECEIVED;
          BULK_TIMEOUT_RESERVED: EventActionEnum.BULK_TIMEOUT_RESERVED;
          BULK_GET: EventActionEnum.BULK_GET;
          CLOSE: EventActionEnum.CLOSE;
          COMMIT: EventActionEnum.COMMIT;
          CREATE: EventActionEnum.CREATE;
          DELETE: EventActionEnum.DELETE;
          EVENT: EventActionEnum.EVENT;
          FAIL: EventActionEnum.FAIL;
          FORWARDED: EventActionEnum.FORWARDED;
          FULFIL: EventActionEnum.FULFIL;
          FULFIL_DUPLICATE: EventActionEnum.FULFIL_DUPLICATE;
          FX_FULFIL: EventActionEnum.FX_FULFIL;
          FX_ABORT: EventActionEnum.FX_ABORT,
          FX_COMMIT: EventActionEnum.FX_COMMIT,
          FX_PREPARE: EventActionEnum.FX_PREPARE,
          FX_REJECT: EventActionEnum.FX_REJECT,
          FX_RESERVE: EventActionEnum.FX_RESERVE,
          FX_PREPARE_DUPLICATE: EventActionEnum.FX_PREPARE_DUPLICATE,
          FX_ABORT_VALIDATION: EventActionEnum.FX_ABORT_VALIDATION,
          FX_RESERVED_ABORTED: EventActionEnum.FX_RESERVED_ABORTED,
          FX_FORWARDED: EventActionEnum.FX_FORWARDED,
          FX_FULFIL_DUPLICATE: EventActionEnum.FX_FULFIL_DUPLICATE,
          FX_ABORT_DUPLICATE: EventActionEnum.FX_ABORT_DUPLICATE,
          FX_TIMEOUT_RECEIVED: EventActionEnum.FX_TIMEOUT_RECEIVED,
          FX_TIMEOUT_RESERVED: EventActionEnum.FX_TIMEOUT_RESERVED,
          FX_GET: EventActionEnum.FX_GET,
          FX_NOTIFY: EventActionEnum.FX_NOTIFY,
          GET: EventActionEnum.GET;
          INITIATE: EventActionEnum.INITIATE;
          LIMIT_ADJUSTMENT: EventActionEnum.LIMIT_ADJUSTMENT;
          LOOKUP: EventActionEnum.LOOKUP;
          POSITION: EventActionEnum.POSITION;
          POSITION_PREPARE: EventActionEnum.POSITION_PREPARE;
          POSITION_FULFIL: EventActionEnum.POSITION_FULFIL;
          PREPARE: EventActionEnum.PREPARE;
          PREPARE_DUPLICATE: EventActionEnum.PREPARE_DUPLICATE;
          PROCESSING: EventActionEnum.PROCESSING;
          RECORD_FUNDS_IN: EventActionEnum.RECORD_FUNDS_IN;
          RECORD_FUNDS_OUT_ABORT: EventActionEnum.RECORD_FUNDS_OUT_ABORT;
          RECORD_FUNDS_OUT_COMMIT: EventActionEnum.RECORD_FUNDS_OUT_COMMIT;
          RECORD_FUNDS_OUT_PREPARE_RESERVE: EventActionEnum.RECORD_FUNDS_OUT_PREPARE_RESERVE;
          REJECT: EventActionEnum.REJECT;
          RESOLVE: EventActionEnum.RESOLVE;
          REQUEST: EventActionEnum.REQUEST;
          RESERVE: EventActionEnum.RESERVE;
          RESERVED_ABORTED: EventActionEnum.RESERVED_ABORTED;
          SETTLEMENT_WINDOW: EventActionEnum.SETTLEMENT_WINDOW;
          TIMEOUT_RECEIVED: EventActionEnum.TIMEOUT_RECEIVED;
          TIMEOUT_RESERVED: EventActionEnum.TIMEOUT_RESERVED;
          TRANSFER: EventActionEnum.TRANSFER;
          PATCH: EventActionEnum.PATCH;
          PUT: EventActionEnum.PUT;
          POST: EventActionEnum.POST;
        };
        Type: {
          ADMIN: EventTypeEnum.ADMIN;
          AUTHORIZATION: EventTypeEnum.AUTHORIZATION;
          ACCOUNT: EventTypeEnum.ACCOUNT;
          BULK: EventTypeEnum.BULK;
          BULK_QUOTE: EventTypeEnum.BULK_QUOTE;
          BULK_PROCESSING: EventTypeEnum.BULK_PROCESSING;
          BULK_PREPARE: EventTypeEnum.BULK_PREPARE;
          BULK_FULFIL: EventTypeEnum.BULK_FULFIL;
          CONSENT: EventTypeEnum.CONSENT;
          CONSENT_REQUEST: EventTypeEnum.CONSENT_REQUEST;
          ENDPOINTCACHE: EventTypeEnum.ENDPOINTCACHE;
          EVENT: EventTypeEnum.EVENT;
          FULFIL: EventTypeEnum.FULFIL;
          FX_QUOTE: EventTypeEnum.FX_QUOTE;
          GET: EventTypeEnum.GET;
          NOTIFICATION: EventTypeEnum.NOTIFICATION;
          ORACLE: EventTypeEnum.ORACLE;
          POSITION: EventTypeEnum.POSITION;
          PREPARE: EventTypeEnum.PREPARE;
          QUOTE: EventTypeEnum.QUOTE;
          SERVICE: EventTypeEnum.SERVICE;
          SETTLEMENT: EventTypeEnum.SETTLEMENT;
          SETTLEMENT_WINDOW: EventTypeEnum.SETTLEMENT_WINDOW;
          THIRDPARTY: EventTypeEnum.THIRDPARTY;
          TRANSACTION_REQUEST: EventTypeEnum.TRANSACTION_REQUEST;
          TRANSFER: EventTypeEnum.TRANSFER;
          PARTY: EventTypeEnum.PARTY;
          PARTICIPANT: EventTypeEnum.PARTICIPANT;
          DEFERRED_SETTLEMENT: EventTypeEnum.DEFERRED_SETTLEMENT,
          GROSS_SETTLEMENT: EventTypeEnum.GROSS_SETTLEMENT,
          VERIFICATION: EventTypeEnum.VERIFICATION;
        };
      };
    };
    Transfers: {
      TransferInternalState: {
        ABORTED_ERROR: TransferInternalStateEnum.ABORTED_ERROR;
        ABORTED_REJECTED: TransferInternalStateEnum.ABORTED_REJECTED;
        COMMITTED: TransferInternalStateEnum.COMMITTED;
        EXPIRED_PREPARED: TransferInternalStateEnum.EXPIRED_PREPARED;
        EXPIRED_RESERVED: TransferInternalStateEnum.EXPIRED_RESERVED;
        FAILED: TransferInternalStateEnum.FAILED;
        INVALID: TransferInternalStateEnum.INVALID;
        RECEIVED_ERROR: TransferInternalStateEnum.RECEIVED_ERROR;
        RECEIVED_FULFIL: TransferInternalStateEnum.RECEIVED_FULFIL;
        RECEIVED_PREPARE: TransferInternalStateEnum.RECEIVED_PREPARE;
        RECEIVED_REJECT: TransferInternalStateEnum.RECEIVED_REJECT;
        RESERVED: TransferInternalStateEnum.RESERVED;
        RESERVED_FORWARDED: TransferInternalStateEnum.RESERVED_FORWARDED;
        RESERVED_TIMEOUT: TransferInternalStateEnum.RESERVED_TIMEOUT;
      };
      TransferState: {
        RECEIVED: TransferStateEnum.RECEIVED;
        ABORTED: TransferStateEnum.ABORTED;
        COMMITTED: TransferStateEnum.COMMITTED;
        RESERVED: TransferStateEnum.RESERVED;
        SETTLED: TransferStateEnum.SETTLED;
      };
      BulkProcessingState: {
        RECEIVED: BulkProcessingStateEnum.RECEIVED;
        RECEIVED_DUPLICATE: BulkProcessingStateEnum.RECEIVED_DUPLICATE;
        RECEIVED_INVALID: BulkProcessingStateEnum.RECEIVED_INVALID;
        ACCEPTED: BulkProcessingStateEnum.ACCEPTED;
        PROCESSING: BulkProcessingStateEnum.PROCESSING;
        FULFIL_DUPLICATE: BulkProcessingStateEnum.FULFIL_DUPLICATE;
        FULFIL_INVALID: BulkProcessingStateEnum.FULFIL_INVALID;
        COMPLETED: BulkProcessingStateEnum.COMPLETED;
        REJECTED: BulkProcessingStateEnum.REJECTED;
        EXPIRED: BulkProcessingStateEnum.EXPIRED;
        ABORTING: BulkProcessingStateEnum.ABORTING;
      };
      BulkTransferState: {
        ABORTING: BulkTransferStateEnum.ABORTING;
        ACCEPTED: BulkTransferStateEnum.ACCEPTED;
        COMPLETED: BulkTransferStateEnum.COMPLETED;
        EXPIRED: BulkTransferStateEnum.EXPIRED;
        EXPIRING: BulkTransferStateEnum.EXPIRING;
        INVALID: BulkTransferStateEnum.INVALID;
        PENDING_FULFIL: BulkTransferStateEnum.PENDING_FULFIL;
        PENDING_INVALID: BulkTransferStateEnum.PENDING_INVALID;
        PENDING_PREPARE: BulkTransferStateEnum.PENDING_PREPARE;
        PROCESSING: BulkTransferStateEnum.PROCESSING;
        RECEIVED: BulkTransferStateEnum.RECEIVED;
        REJECTED: BulkTransferStateEnum.REJECTED;
      };
      BulkTransferStateEnum: {
        ACCEPTED: BulkTransferStateEnumDeclaration.ACCEPTED;
        COMPLETED: BulkTransferStateEnumDeclaration.COMPLETED;
        EXPIRED: BulkTransferStateEnumDeclaration.EXPIRED;
        EXPIRING: BulkTransferStateEnumDeclaration.EXPIRING;
        INVALID: BulkTransferStateEnumDeclaration.INVALID;
        PENDING_FULFIL: BulkTransferStateEnumDeclaration.PENDING_FULFIL;
        PENDING_INVALID: BulkTransferStateEnumDeclaration.PENDING_INVALID;
        PENDING_PREPARE: BulkTransferStateEnumDeclaration.PENDING_PREPARE;
        PROCESSING: BulkTransferStateEnumDeclaration.PROCESSING;
        RECEIVED: BulkTransferStateEnumDeclaration.RECEIVED;
        REJECTED: BulkTransferStateEnumDeclaration.REJECTED;
      };
      AdminTransferAction: {
        RECORD_FUNDS_IN: AdminTransferActionEnum.RECORD_FUNDS_IN;
        RECORD_FUNDS_OUT_PREPARE_RESERVE: AdminTransferActionEnum.RECORD_FUNDS_OUT_PREPARE_RESERVE;
        RECORD_FUNDS_OUT_COMMIT: AdminTransferActionEnum.RECORD_FUNDS_OUT_COMMIT;
        RECORD_FUNDS_OUT_ABORT: AdminTransferActionEnum.RECORD_FUNDS_OUT_ABORT;
      };
      AdminNotificationActions: {
        LIMIT_ADJUSTMENT: AdminNotificationActionsEnum.LIMIT_ADJUSTMENT;
      };
    };
  }

  interface Cacheable {
    initializeCache(policyOptions: object, config: { hubName: string, hubNameRegex: RegExp }): Promise<boolean>
    stopCache(): Promise<void>
  }

  interface Endpoints extends Cacheable {
    getEndpoint(switchUrl: string, fsp: string, endpointType: FspEndpointTypesEnum, options?: any): Promise<string>
    getEndpointAndRender(switchUrl: string, fsp: string, endpointType: FspEndpointTypesEnum, path: string, options?: any): Promise<string>
  }

  interface Participants extends Cacheable {
    getParticipant(switchUrl: string, fsp: string): Promise<object>
    invalidateParticipantCache(fsp: string): Promise<void>
  }

  type ProxyNames = string[]
  interface Proxies extends Cacheable {
    getAllProxiesNames(switchUrl: string): Promise<ProxyNames>
    invalidateProxiesCache(): Promise<void>
  }

  interface ProtocolVersionsType {
    content: string,
    accept: string
  }

  type RequestParams = { url: string, headers: HapiUtil.Dictionary<string>, source: string, destination: string, hubNameRegex: RegExp, method?: RestMethodsEnum, payload?: any, responseType?: string, span?: any, jwsSigner?: any, protocolVersions?: ProtocolVersionsType }
  interface Request {
    sendRequest(params: RequestParams): Promise<any>
  }

  interface Kafka {
    createGeneralTopicConf(template: string, functionality: string, action: string, key?: string, partition?: number, opaqueKey?: any, topicNameOverride?: string): {topicName: string, key: string | null, partition: number | null, opaqueKey: any }
  }

  type MimeTypes = 'text/plain' | 'application/json' | 'application/vnd.interoperability.'
  interface StreamingProtocol {
    decodePayload(input: string, options: Object): Object
    encodePayload(input: string | Buffer, mimeType: MimeTypes): string
  }

  interface HeaderValidation {
    protocolVersions: { anyVersion: symbol, ONE: Array<string>, TWO: Array<string> },
    protocolVersionsMap: Array<{ key: string, value: string }>,
    getHubNameRegex(hubName: string): RegExp,
    generateAcceptRegex(resource: string): RegExp,
    generateContentTypeRegex(resource: string): RegExp,
    parseAcceptHeader(resource: string, header: string): { valid: boolean, versions?: Set<string | symbol> },
    parseContentTypeHeader(resource: string, header: string): { valid: boolean, version?: string },
    convertSupportedVersionToExtensionList(supportedVersions: Array<number>): Array<{ key: string, value: string }>
  }

  type ProtocolResources = string[]
  type ProtocolVersions = (string | symbol)[]
  type ApiTypeValues = 'fspiop' | 'iso20022'
  type APIDocumentationPluginOptions =
  | { documentPath: string; document?: never }
  | { document?: string; documentPath?: never }

  type LoggingPluginOptions = {
    log?: ILogger,
    internalRoutes?: string[],
    traceIdHeader?: string
  }

  type HapiUtil = {
    HapiRawPayload: {
      plugin: {
        name: string,
        register: (server: Server) => void
      }
    };
    FSPIOPHeaderValidation: {
      plugin: {
        name: string,
        register: (
          server: Server,
          options: {
            resources: ProtocolResources,
            supportedProtocolContentVersions: ProtocolVersions,
            supportedProtocolAcceptVersions: ProtocolVersions,
            apiType: ApiTypeValues
          }
        ) => void
      },
      errorMessages: Record<string, string>,
      defaultProtocolResources: ProtocolResources
      defaultProtocolVersions: ProtocolVersions
    };
    OpenapiBackendValidator: {
      plugin: {
        name: string,
        register: (server: Server) => void
      }
    };
    HapiEventPlugin: {
      plugin: {
        name: string,
        register: (server: Server) => void
      }
    };
    customCurrencyCodeValidation: (joi: any) => {
      base: any;
      type: string;
      messages: {
        'currency.base': string;
      };
      rules: {
        currency: {
          validate: (value: string, helpers: any) => string | any;
        };
      };
    };
    APIDocumentation: {
      plugin: {
        name: string,
        register: (server: Server, options: APIDocumentationPluginOptions) => void
      }
    };
    loggingPlugin: {
      name: string,
      register: (server: Server, options?: LoggingPluginOptions) => Promise<void>
    };
    API_TYPES: Record<ApiTypeValues, ApiTypeValues>;
  }
  // todo: define the rest of the types

  interface PubSub {
    (config: object, publisherClient?: IORedis, subscriberClient?: IORedis): PubSub;
    new (config: object, publisherClient?: IORedis, subscriberClient?: IORedis): PubSub;
    connect(): Promise<void>;
    disconnect(): Promise<boolean>;
    healthCheck(): Promise<boolean>;
    isConnected: { publisherConnected: boolean; subscriberConnected: boolean };
    publish(channel: string, message: any): Promise<void>;
    subscribe(channel: string, callback: (message: any) => void): Promise<string>;
    unsubscribe(channel: string): Promise<void>;
    broadcast(channels: string[], message: any): Promise<void>;
  }

  interface RedisCache {
    (config: object, client?: IORedis): RedisCache;
    new (config: object, client?: IORedis): RedisCache;
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    healthCheck(): Promise<boolean>;
    isConnected: boolean;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clearCache(): Promise<void>;
  }

  interface Redis {
    PubSub: PubSub;
    RedisCache: RedisCache;
  }

  type RedisInstanceConfig = 
    | {
        type: 'redis';
        host: string;
        port: number;
      }
    | {
        type: 'redis-cluster';
        cluster: Array<{ host: string; port: number }>;
      };

  interface DistributedLockConfig {
    redisConfigs: RedisInstanceConfig[];
    driftFactor?: number;
    retryCount?: number;
    retryDelay?: number;
    retryJitter?: number;
    lockTimeout?: number;
  }

  interface LockInterface {
    acquire(key: string, ttl: number, acquireTimeout?: number): Promise<string>;
    release(): Promise<boolean>;
    extend(ttl: number): Promise<string>;
  }

  interface DistributedLock extends LockInterface {
    config: DistributedLockConfig;
    logger: ILogger;
    redisInstances: IORedis[];
  }

  interface DistLock {
    createLock(config: DistributedLockConfig, logger?: ILogger): DistributedLock;
  }

  interface Util {
    Endpoints: Endpoints;
    Participants: Participants;
    proxies: Proxies;
    Hapi: HapiUtil;
    Kafka: Kafka;
    OpenapiBackend: any;
    Request: Request;
    StreamingProtocol: StreamingProtocol;
    HeaderValidation: HeaderValidation;
    Redis: Redis;
    distLock: DistLock;
  }

  const Enum: Enum
  const Util: Util
  const HealthCheck: any

  namespace mysql {
    class KnexWrapper {
      constructor(deps: KnexWrapperDeps);
      knex: Knex;
      isConnected: boolean;
      connect(): Promise<void>;
      disconnect(): Promise<void>;
      executeWithErrorCount(queryFn: Function, operation?: string, step?: string): Promise<unknown>;
      handleError(error: unknown, operation?: string, step?: string, needRethrow?: boolean): void;
    }
  }
}

type KnexWrapperDeps = {
  knexOptions: Knex.Config;
  metrics: MetricsClient;
  logger: ILogger;
  retryOptions?: RetryConnOptions;
  context?: string;
}

type MetricsClient = { // Wrapper for prom-client from @mojaloop/central-services-metrics
  getCounter(name: string): {
    inc(details: Record<string, unknown>): void;
  };
}

interface RetryConnOptions { // see opts from https://www.npmjs.com/package/async-retry#api
  retries?: number;
  factor?: number;
  minTimeout?: number;
  maxTimeout?: number;
  randomize?: boolean;
  onRetry?: (error: Error) => void;
}

export = CentralServicesShared
