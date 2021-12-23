import Swal, { SweetAlertResult } from 'sweetalert2';

export const SwalConfig = {
  focusConfirm: false,
  focusCancel: true,
  confirmButtonText: 'Yes',
  cancelButtonText: 'No',
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonClass: 'btn btn-success mr-2',
  cancelButtonClass: 'btn btn-danger',
  buttonsStyling: false,
  allowOutsideClick: false,
  customClass: {
    input: 'form-control mb-0'
  }
};

export const alertConfirm = (
  text: string = 'Make sure, Do you want to process ?',
  title: string = 'Are you sure ?',
  cb?: Function
): Promise<SweetAlertResult> => {
  return new Promise((resolve, reject) => {
    Swal.fire({
      ...SwalConfig,
      title: title,
      html: text,
      showCancelButton: true
    }).then(result => {
      if (result.value) {
        if (cb) {
          cb(result);
        }
      }
      resolve(result);
    });
  });
};

export const alertWarning = (
  html: string = `
  <p>Please try again..</p>
  <span style="color: red; white-space: pre-line;">...</span>
  `,
  title: string = 'Warning',
  cb?: Function
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    Swal.fire({
      ...SwalConfig,
      type: 'warning',
      title: title,
      html: html,
      showConfirmButton: true,
      allowOutsideClick: false,
      confirmButtonClass: 'btn btn-light',
      confirmButtonText: 'OK',
      onClose: () => {
        if (cb) {
          cb();
        }
        resolve(true);
      }
    });
  });
};

export const alertSuccess = (
  html: string = 'Successful..!',
  title: string = 'Success',
  cb?: Function
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    Swal.fire({
      ...SwalConfig,
      type: 'success',
      title: title,
      html: html,
      showConfirmButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'OK',
      onClose: () => {
        if (cb) {
          cb();
        }
        resolve(true);
      }
    });
  });
};

export const alertError = (html: string = 'Failure..!', title: string = 'Fail', cb?: Function): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    Swal.fire({
      ...SwalConfig,
      type: 'error',
      title: title,
      html: html,
      showConfirmButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'OK',
      onClose: () => {
        if (cb) {
          cb();
          resolve(true);
        }
      }
    });
  });
};

export const onLoading = (
  html: string = 'ระบบกำลังทำการประมวลผล...',
  title: string = 'กรุณารอสักครู่',
  cb?: Function
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    Swal.fire({
      ...SwalConfig,
      title: title,
      html: html,
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
      onClose: () => {
        if (cb) {
          cb();
        }
        resolve(true);
      }
    });
  });
};

export const onLoaded = (): void => {
  Swal.close();
};
