function makePayment(customer, charge) {
  var handler = PaystackPop.setup({
    key: 'pk_test_c3cd2b6a8c267691e93f3b29ab8c015061618895', //put your public key here
    email: customer.emailAddress, //put your customer's email here
    amount: parseFloat(charge.amount) * 100, //amount the customer is supposed to pay
    metadata: {
      custom_fields: [
        {
          display_name: 'Mobile Number',
          variable_name: 'mobile_number',
          value: '+2348012345678', //customer's mobile number
        },
      ],
    },
    callback: function (response) {
      //after the transaction have been completed
      //make post call  to the server with to verify payment
      //using transaction reference as post data
      console.log(response);
      var data = { reference: response.reference };

      $.each($('#payment-form').serializeArray(), function (_, field) {
        data[field.name] = field.value;
      });

      $.post('/api/makepayment/', data, function (data) {
        if (data.status == 'success') {
          console.log(data);
          //successful transaction
          alert('Transaction was successful');
          $('<form>', {
            id: 'electionFormReceipt',
            html:
              '<input type="text" name="paymentId" value="' +
              data.candidate.paymentId +
              '">',
            action: '/student/electionformreceipt/',
            method: 'post',
          })
            .appendTo(document.body)
            .submit();
        }
        //transaction failed
        else alert(response);
      });
    },
    onClose: function () {
      //when the user close the payment modal
      alert('Transaction cancelled');
    },
  });
  handler.openIframe(); //open the paystack's payment modal
}

function print(event) {
  event.preventDefault();
  var body = $('#printable').html();
  if (!body) return console.log('nothing to print');

  var win = window.open(
    '',
    '_blank',
    'left=0, top=0, titlebar=0, width=500, height=500',
    true
  );

  var title = `<head><title>Evoting System</title><style>
    table,th,td {
      border: 1px;
    }
  </style></head>`;
  body = title + body;
  win.document.write(body);
  win.print();
}

var Component = (function () {
  return function (source, target, data) {
    if (!target && !source)
      throw new Error('two required args were not provided.');

    // eventHandlers = eventHandlers || [];
    data = data || { state: {} };
    data['state'] = { id: 0 };

    function render(mode, html) {
      if (mode === 'a') $(target).append(html);
      else $(target).html(html);
    }

    function create(mode) {
      mode = mode === 'a' ? mode : 'n';
      var template = $(source).html();
      if (template === undefined) throw new Error('provide a valid template');
      var html = Mustache.to_html(template, data);

      data.state.id += 1;

      render(mode, html);
    }

    // function addEvent(context, target, eventType, eventHandler) {
    //   $(context).on(eventType, target, eventHandler);
    // }

    return {
      create: create,
    };
  };
})();

var Loading = (function () {
  function show(target) {
    Component('#loading-template', target, {}).create('a');
  }
  function hide(target) {
    $(target + ' .loading').remove();
  }
  return {
    show: show,
    hide: hide,
  };
})();

var APIRequest = (function () {
  var errorHandler = function (error) {
    console.log('operation failed', error);
  };

  return {
    fetch: function (options) {
      var url = options.url;
      var success = options.success;

      $.get(url, success).fail(errorHandler);
    },
    submit: function (options) {
      var url = options.url;
      var context = options.context;
      var success = options.success;

      $(context).ajaxSubmit({
        url: url,
        success: success,
        error: errorHandler,
      });
    },
  };
})();

var ValidatorModule = function () {
  return {
    hasValue: function (val) {
      return val !== '';
    },
    isStrongPassword: function (val) {
      return /^(?=.*[a-z])(?=.*\d)[\S]{6,10}$/.test(val);
    },
    isEmail: function (val) {
      return /^(\w)+@(\w)+\.(\w){2,}$/.test(val);
    },
    isMatricNo: function (val) {
      return /\d{4}\/(nd|hnd)\/\w{3,5}\/\d{5,}/.test(val.toLowerCase());
    },
    isMatch: function () {
      return $('#password').val() === $('#confirmPassword').val();
    },
  };
};

function validate(errors, formData, validateData) {
  validateData = validateData || Object.create(null);
  validators = ValidatorModule();

  $.each(formData, function (_, field) {
    var name = field.name,
      value = field.value;
    // clean error messages
    $('#' + name + 'Error').text('');
    $('[name="' + name + '"]').removeClass('red-border');

    if (validateData[name]) {
      if (!validators[validateData[name].handler](value)) {
        errors[name] = validateData[name].message;
      }
    } else {
      if (!validators.hasValue(value)) {
        errors[name] = 'this field must not be empty.';
      }
    }
  });

  return errors;
}

function validateElement(target, validator) {
  validator = validator || ValidatorModule().hasValue;
  var element = $(target);
  var value = element.val();
  var valueOk = validator(value);
  if (valueOk) {
    element.removeClass('red-border');
  } else {
    element.addClass('red-border');
  }
}

function showErrors(errors) {
  for (var field in errors) {
    var errField = $('#' + field + 'Error');
    if (errField.length > 0) {
      errField.html(errors[field]);
    } else {
      $('#' + field).addClass('red-border');
    }
  }
}

function refreshPage(url, delay) {
  delay = delay || 100;
  url = url || window.location.href;

  setTimeout(function () {
    window.location = url;
  }, delay);
}

function isCurrentPage(target) {
  if ($(target).length > 0) return true;
  return false;
}

var Queries = (function (request) {
  return {
    positions: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/positions/' + queryString,
        success: callback,
      });
    },
    departments: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/departments/' + queryString,
        success: callback,
      });
    },
    elections: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/elections/' + queryString,
        success: callback,
      });
    },
    levels: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/levels/' + queryString,
        success: callback,
      });
    },
    electionpositions: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/electionpositions/' + queryString,
        success: callback,
      });
    },
    currentUser: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/currentuser/' + queryString,
        success: callback,
      });
    },
    payments: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/payments/' + queryString,
        success: callback,
      });
    },
    candidates: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/candidates/' + queryString,
        success: callback,
      });
    },
    electionCandidates: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/electioncandidates/' + queryString,
        success: callback,
      });
    },
    students: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/students/' + queryString,
        success: callback,
      });
    },
    adminDashboardSummary: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/admin/dashboard/summary/' + queryString,
        success: callback,
      });
    },
    electionresult: function (callback, queryString) {
      queryString = queryString ? '?' + queryString : '?';
      request.fetch({
        url: '/api/electionresult/' + queryString,
        success: callback,
      });
    },
  };
})(APIRequest);

var Mutation = (function (request) {
  return {
    addPosition: function (e) {
      e.preventDefault();

      var errors = {};
      validate(errors, $(this).serializeArray());
      if (!$.isEmptyObject(errors)) {
        // for (error in errors) {
        //   $('#' + error).text(errors[error]);
        // }
        showErrors(errors);
      } else {
        Loading.show('#new-position-pane');
        // submit form to server
        request.submit({
          url: '/api/positions/',
          context: this,
          success: function (data) {
            Loading.hide('#new-position-pane');
            if (data.error === null) {
              refreshPage('/admin/positions/');
            } else {
              showErrors(data.error);
            }
          },
        });
      }
    },
    updatePosition: function (e) {
      e.preventDefault();
      var _this = $(e.currentTarget);
      var errors = {};

      validate(errors, _this.serializeArray());

      if (!$.isEmptyObject(errors)) {
        // for (error in errors) {
        //   $('#' + error).text(errors[error]);
        // }
        showErrors(errors);
      } else {
        Loading.show('#edit-position-pane');
        // submit form to server
        request.submit({
          url: '/api/positions/?_METHOD=PUT',
          context: _this,
          success: function (data) {
            Loading.hide('#edit-position-pane');
            if (data.error === null) {
              refreshPage('/admin/positions/');
            } else {
              showErrors(data.error);
            }
          },
        });
      }
    },
    deletePosition: function (e) {
      e.preventDefault();
      var btn = $(e.currentTarget);
      btn.attr('disabled', 'true');
      var thisForm = $(btn.attr('data-target-form'));
      request.submit({
        url: '/api/positions/?_METHOD=DELETE',
        context: thisForm,
        success: function (data) {
          if (data.error === null) {
            refreshPage('/admin/positions/');
          } else {
            btn.removeAttr('disabled');
            // display an error msg
          }
        },
      });
    },
    addDepartment: function (e) {
      e.preventDefault();
      var errors = {};
      validate(errors, $(this).serializeArray());
      if ($.isEmptyObject(errors)) {
        request.submit({
          url: '/api/departments/',
          context: this,
          success: function (data) {
            console.log(data);
            if (data.error === null) {
              refreshPage('/admin/departments/');
            } else {
              showErrors(data.error);
            }
          },
        });
      } else {
        showErrors(errors);
      }
    },
    updateDepartment: function (e) {
      e.preventDefault();
      var _this = $(e.currentTarget);
      errors = {};
      validate(errors, _this.serializeArray());
      if ($.isEmptyObject(errors)) {
        //submit
        APIRequest.submit({
          url: '/api/departments/?_METHOD=PUT',
          context: _this,
          success: function (data) {
            if (data.error === null) {
              refreshPage('/admin/departments/');
            } else {
              showErrors(data.error);
            }
          },
        });
      } else {
        showErrors(errors);
      }
    },
    deleteDepartment: function (e) {
      e.preventDefault();
      var btn = $(e.currentTarget);
      var form = $(btn.attr('data-form-target'));
      btn.attr('disabled', 'true');
      APIRequest.submit({
        url: '/api/departments/?_METHOD=DELETE',
        context: form,
        success: function (data) {
          if (data.error === null) {
            refreshPage('/admin/departments/');
          } else {
            btn.removeAttr('disabled');
          }
        },
      });
    },
    addElection: function (e) {
      e.preventDefault();
      var errors = {};
      $('#formError').text('');

      validate(errors, $(this).serializeArray());

      console.log($(this).serializeArray());

      var startDateTime, endDateTime;
      $.each($(this).serializeArray(), function (_, field) {
        if (field.name === 'startDateTime') startDateTime = field.value;
        if (field.name === 'endDateTime') endDateTime = field.value;
      });

      if (startDateTime >= endDateTime)
        errors['form'] =
          'start date time must not be more or same date with end date time.';

      if ($.isEmptyObject(errors)) {
        request.submit({
          url: '/api/elections/',
          context: this,
          success: function (data) {
            console.log(data);
            if (data.error === null) {
              refreshPage('/admin/elections/');
            } else {
              showErrors(data.error);
            }
          },
        });
      } else {
        errors['form'] = 'please fill out empty fields.';
        showErrors(errors);
      }
    },
    addStudent: function (e) {
      e.preventDefault();

      var errors = {};
      validate(errors, $(this).serializeArray(), {
        password: {
          handler: 'isStrongPassword',
          message: 'password must be at least 6-15 characters',
        },
        emailAddress: {
          handler: 'isEmail',
          message: 'email address is not valid',
        },
        matricno: { handler: 'isMatricNo', message: 'wrong matric no format' },
      });

      if ($.isEmptyObject(errors)) {
        Loading.show('#register-pane');
        APIRequest.submit({
          url: '/api/students/',
          context: this,
          success: function (data) {
            Loading.hide('#register-pane');
            if (data.error === null) {
              setTimeout(function () {
                window.location = '/login/';
              }, 100);
            } else {
              showErrors(data.error);
            }
          },
        });
      } else {
        showErrors(errors);
      }
    },
  };
})(APIRequest);

/**
 * Handle Application Events
 *
 * uses jquery v3
 */
$(document).ready(function () {
  $(document).on('hover', '[data-toggle="tooltip"]', function (e) {
    console.log(this);
    $(this).tooltip();
  });

  // toggle show and hide password
  $('[data-toggle="password"]').on('click', function (e) {
    e.preventDefault();
    var ele = $('[data-id="password"]');

    $('[data-toggle="password"] svg').toggleClass('hidden');

    if (ele.attr('type') === 'password') {
      ele.attr('type', 'text');
    } else {
      ele.attr('type', 'password');
    }
  });

  $('.navbar-toggler').on('click', function (event) {
    $(this).toggleClass('show');
  });

  $('#print-btn').on('click', print);

  $('body').on('focus', '[data-time-picker="date-time"]', function (e) {
    $(this).datetimepicker({
      formatDate: 'Y/m/d',
      minDate: 0,
    });
  });

  if (isCurrentPage('#admin-positions-page')) {
    $('#new-position-form').on('submit', Mutation.addPosition);
    $(document).on('submit', '.update-position-form', Mutation.updatePosition);
    Queries.positions(function (data) {
      if (data.error === null) {
        var PositionRowComponent = Component(
          '#position-row-template',
          '#position-row-pane',
          data
        );
        PositionRowComponent.create();
      }
    }, window.location.search.substr(1));
    $(document).on('click', '.delete-position-btn', Mutation.deletePosition);
  }

  //-- Handles Admin Departments events
  if (isCurrentPage('#admin-departments-page')) {
    $('#new-department-form').on('submit', Mutation.addDepartment);
    Queries.departments(function (data) {
      if (data.error === null) {
        var DepartmentRowComponent = Component(
          '#department-row-template',
          '#department-row-pane',
          data
        );
        DepartmentRowComponent.create();
      }
    }, window.location.search.substr(1));
    $(document).on(
      'submit',
      '.update-department-form',
      Mutation.updateDepartment
    );
    $(document).on(
      'click',
      '.delete-department-btn',
      Mutation.deleteDepartment
    );
  }
  //-- End of Admin Departments events

  //-- Handles Admin Election Events
  if (isCurrentPage('#admin-elections-page')) {
    Queries.positions(function (data) {
      function addPosition(event) {
        PositionsRowComponent.create('a');
        var id = $(this).attr('data-id');

        $('#position-pane-' + id + ' button + button').removeAttr('disabled');
        $(this).attr('disabled', 'true');
      }

      function deletePosition(event) {
        var btn = $(this);
        $(btn.attr('data-target')).remove();
      }

      var PositionsRowComponent = Component(
        '#position-row-template',
        '#contestant-position-pane',
        data
      );

      PositionsRowComponent.create();
      $(document).on('click', '.add-contestant-position-btn', addPosition);
      $(document).on(
        'click',
        '.delete-contestant-position-btn',
        deletePosition
      );
    });
    $('#new-election-form').on('submit', Mutation.addElection);
    Queries.elections(function (data) {
      if (data.error === null) {
        var ElectionRowComponent = Component(
          '#election-row-template',
          '#election-row-pane',
          data
        );
        ElectionRowComponent.create();
        Queries.positions(function (data) {
          Component(
            '#election-positions-template',
            '.election-positions',
            data
          ).create('a');
        });
      }
    }, window.location.search.substr(1));
    $(document).on('submit', '.update-election-form', function (e) {
      e.preventDefault();
      var form = $(e.currentTarget);
      var hashId = '#' + form.attr('id');
      var errors = {};
      validate(errors, form.serializeArray());

      if ($.isEmptyObject(errors)) {
        APIRequest.submit({
          url: '/api/elections/?_METHOD=PUT',
          context: form,
          success: function (data) {
            console.log(data);
            if (data.error === null) {
              refreshPage('/admin/elections/');
            } else {
              showErrors(data.error);
            }
          },
        });
      } else {
        for (error in errors) {
          $('[name="' + error + '"]', hashId).addClass('red-border');
          // $('[name="' + error + '"]', hashId).attr('title', errors[error]);
        }
      }
    });
    $(document).on('submit', '.add-election-position-form', function (e) {
      e.preventDefault();
      var form = $(e.currentTarget);
      var errors = {};
      validate(errors, form.serializeArray());
      $('#electionPositionError').text('');

      if ($.isEmptyObject(errors)) {
        APIRequest.submit({
          url: '/api/electionpositions/',
          context: form,
          success: function (data) {
            if (data.error === null) {
              console.log(data);
              Component(
                '#election-position-row-template',
                '#election-positions-row',
                data
              ).create('a');
            } else {
              showErrors(data.error);
            }
          },
        });
      } else {
        showErrors({ electionPosition: 'this form has empty fields.' });
      }
    });
    $(document).on('click', '.delete-election-position-btn', function (e) {
      e.preventDefault();
      var thisBtn = $(e.currentTarget);
      var form = $(thisBtn.attr('data-target-form'));
      var pane = $(thisBtn.attr('data-target-pane'));

      thisBtn.attr('disabled', 'true');
      APIRequest.submit({
        url: '/api/electionpositions/?_METHOD=DELETE',
        context: form,
        success: function (data) {
          if (data.error === null) {
            pane.remove();
          } else {
            thisBtn.removeAttr('disabled');
          }
        },
      });
    });

    $(document).on('click', '.delete-election-btn', function (e) {
      e.preventDefault();

      var thisBtn = $(e.currentTarget);
      var form = $(thisBtn.attr('data-target-form'));
      thisBtn.attr('disabled', true);

      APIRequest.submit({
        url: '/api/elections/?_METHOD=DELETE',
        context: form,
        success: function (data) {
          if (data.error === null) {
            refreshPage('/admin/elections/');
          } else {
            thisBtn.removeAttr('disabled');
            // display dialog box;
          }
        },
      });
    });
  }

  if (isCurrentPage('#registration-page')) {
    Queries.levels(function (levelData) {
      Queries.departments(function (departmentData) {
        Component('#level-option-template', '#level', levelData).create('a');
        Component(
          '#department-option-template',
          '#department',
          departmentData
        ).create('a');
      });
    });

    $('#surname').on('keyup', function (e) {
      validateElement(this);
    });
    $('#othernames').on('keyup', function (e) {
      validateElement(this);
    });
    $('#level').on('blur', function (e) {
      validateElement(this);
    });
    $('#department').on('blur', function (e) {
      validateElement(this);
    });
    $('#matricno').on('keyup', function (e) {
      validateElement(this, ValidatorModule().isMatricNo);
    });
    $('#emailAddress').on('keyup', function (e) {
      validateElement(this, ValidatorModule().isEmail);
    });
    $('#password').on('keyup', function (e) {
      validateElement(this, ValidatorModule().isStrongPassword);
    });
    $('#confirmPassword').on('keyup', function (e) {
      validateElement(this, function (e) {
        var val1 = $('#password').val();
        var val2 = $('#confirmPassword').val();
        return val1 === val2;
      });
    });

    $('#register-form').on('submit', Mutation.addStudent);
  }

  function accountLogin(context, url, redirectUrl) {
    var msgBox = $('#msg-box');
    msgBox.removeClass('hidden');
    msgBox.removeClass('alert-success');
    msgBox.removeClass('alert-danger');

    msgBox.html(
      '<div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated w-100 bg-success font-weight-bold">Connecting to server ... please wait </div> </div>'
    );

    APIRequest.submit({
      url: url,
      context: context,
      success: function (data) {
        if (data.error === null) {
          msgBox.addClass('alert-success');
          msgBox.html(
            '<i class="fas fa-check-circle mr-2"></i> ' + data.message
          );
          refreshPage(redirectUrl);
        } else {
          msgBox.addClass('alert-danger');
          msgBox.html(
            '<i class="fas fa-exclamation-triangle mr-2"></i> ' + data.message
          );
        }
      },
    });
  }

  function arrayToObj(arr) {
    i = 0;
    t = '';
    return arr.reduce(function (a, v) {
      if (i === 0) {
        t = v;
        a[t] = '';
        ++i;
      } else {
        a[t] = v;
        i = 0;
      }
      return a;
    }, {});
  }

  $('#student-login').on('submit', function (e) {
    e.preventDefault();
    var redirectUrl = arrayToObj(window.location.search.substr(1).split('='));

    redirectUrl = redirectUrl.redirecturl ? redirectUrl.redirecturl : '/';
    accountLogin(this, '/api/student/login/', redirectUrl);
  });

  $('#admin-login').on('submit', function (e) {
    e.preventDefault();
    var redirectUrl = arrayToObj(window.location.search.substr(1).split('='));
    redirectUrl = redirectUrl.redirecturl ? redirectUrl.redirecturl : '/admin/';

    accountLogin(this, '/api/admin/login/', redirectUrl);
  });

  var CountDownTimer = (function () {
    function padZero(value) {
      return value < 10 ? '0' + value : value;
    }

    function setTime(time) {
      var hours = Number(time.hours) > 0 ? Number(time.hours) : 0;
      var minutes = Number(time.minutes) > 0 ? Number(time.minutes) : 0;
      var seconds = Number(time.seconds) > 0 ? Number(time.seconds) : 0;

      if (hours > 0 && minutes === 0) {
        --hours, (minutes = 60);
      }

      if (minutes > 0 && seconds === 0) {
        --minutes, (seconds = 60);
      }

      if (seconds > 0) {
        --seconds;
      }
      return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      };
    }

    function timeStr(time) {
      return (
        padZero(time.hours) +
        ' : ' +
        padZero(time.minutes) +
        ' : ' +
        padZero(time.seconds)
      );
    }

    return {
      start: function () {
        $('.timer').each(function (_, obj) {
          var timer = $(obj);
          var time = timer.attr('data-time') || '0:0:0';
          var id = timer.attr('data-id');
          var btn = $('#btn-' + id);

          time = time.split(':');
          timeObj = setTime({
            hours: time[0],
            minutes: time[1],
            seconds: time[2],
          });

          // console.log(timeObj);

          if (
            timeObj.hours === 0 &&
            timeObj.minutes === 0 &&
            timeObj.seconds === 0
          ) {
            btn.removeAttr('disabled');
          }
          timer.attr('data-time', timeStr(timeObj));
          timer.text(timeStr(timeObj));
        });
      },
    };
  })();

  setInterval(function () {
    CountDownTimer.start();
  }, 1000);

  if (isCurrentPage('#student-election-page')) {
    Queries.elections(function (data) {
      if (data.error === null) {
        Component(
          '#election-row-template',
          '#election-row-pane',
          data
        ).create();
      }
    }, 'status=active');
  }

  if (isCurrentPage('#election-form-purchase-page')) {
    Queries.elections(function (data) {
      if (data.error === null) {
        Component(
          '#election-row-template',
          '#election-row-pane',
          data
        ).create();
      }
    }, 'status=active');
  }

  if (isCurrentPage('#student-makepayment-page')) {
    var electionPosition = $('#student-makepayment-page').attr(
      'data-election-position'
    );
    Queries.electionpositions(function (electionPositionData) {
      Queries.currentUser(function (userData) {
        console.log(electionPositionData);
        Loading.hide('body');
        Component('#payment-template', '#payment-pane', {
          electionPositions: electionPositionData.electionPositions,
          user: userData.user,
        }).create();

        $('#make-payment-btn').on('click', function (e) {
          makePayment(userData.user, {
            amount: electionPositionData.electionPositions[0].formPrice,
          });
        });
      });
    }, 'id=' + electionPosition);
  }

  $('[data-dismiss="msgbox"').on('click', function (e) {
    $('.msgbox').remove();
  });

  if (isCurrentPage('#election-form-receipt-page')) {
    var paymentId = $('#election-form-receipt-page').attr('data-paymentid');
    console.log(paymentId);
    Queries.payments(function (paymentData) {
      console.log(paymentData);
      Component('#receipt-template', '#receipt-pane', paymentData).create();
    }, 'id=' + paymentId);
  }

  if (isCurrentPage('#campaign-page')) {
    Queries.currentUser(function (userData) {
      var studentId = userData.user ? userData.user.id : undefined;
      Queries.candidates(function (candidateData) {
        console.log(candidateData);
        // candidates = candidateData.candidates.length > 0 ? candidateData.candidates : null;
        // console.log(candidates)
        Component(
          '#campaign-template',
          '#candidate-pane',
          candidateData
        ).create();
      }, 'studentId=' + studentId);
    });

    $(document).on('submit', '.update-campaign', function (e) {
      e.preventDefault();
      var canUpdate = true;

      $.each($(this).serializeArray(), function (_, field) {
        validateElement('#' + field.name, ValidatorModule().hasValue);
        if (field.value === '') canUpdate = false;
      });

      if (canUpdate) {
        Loading.show();
        APIRequest.submit({
          url: '/api/candidates/?_METHOD=PUT',
          context: this,
          success: function (data) {
            Loading.hide();
            refreshPage('/student/campaigns/');
            console.log(data);
          },
        });
      }
    });
  }

  if (isCurrentPage('#student-vote-page')) {
    var electionId = $('#student-vote-page').attr('data-election-id');

    Queries.electionpositions(function (electionPositionData) {
      Queries.electionCandidates(function (electionCandidateData) {
        Loading.hide('body');
        Component(
          '#election-position-template',
          '#election-position-pane',
          electionPositionData
        ).create();

        console.log(electionCandidateData);

        Component(
          '#candidate-template',
          '#candidate-pane',
          electionCandidateData
        ).create();
        var totalVotes = electionCandidateData.totalVotes;

        for (var cid in totalVotes) {
          $('#vote-counter-' + cid).text(totalVotes[cid]);
        }
      }, 'electionid=' + electionId + '&cancontest=1');
    }, 'electionid=' + electionId);

    // $(document).on('click', '.voting-form', function (e) {
    //   e.preventDefault();
    //   APIRequest.submit({
    //     url: '/api/votes',
    //     context: this,
    //     success: function (voteData) {
    //       console.log(voteData);
    //       if (voteData.error === null) {
    //         for (let cid in voteData.totalVotes) {
    //           $('#vote-counter-' + cid).text(voteData.totalVotes[cid]);
    //         }
    //       }
    //     },
    //   });
    // });
  }

  $(window).scroll(function (e) {
    var top = $(this).scrollTop();
    var width = document.body.offsetWidth;

    if (width > 575) {
      if ($('.mainSidebar').length > 0) {
        var margin =
          Number($('.mainSidebar').css('margin-top').replace('px', '')) - top;

        // console.log(margin);
        if (margin > 0) {
          $('.mainSidebar').css('margin-top', margin + 'px');
        } else if (margin < 0) {
          $('.mainSidebar').css('margin-top', '0px');
        } else {
          $('.mainSidebar').css('margin-top', '63px');
        }
      }
    }
  });

  if (isCurrentPage('#admin-dashboard')) {
    Queries.students(function (studentData) {
      Component(
        '#student-row-template',
        '#student-row-pane',
        studentData
      ).create();
      Queries.candidates(function (candidateData) {
        Component(
          '#candidate-row-template',
          '#candidate-row-pane',
          candidateData
        ).create();

        Queries.payments(function (paymentData) {
          Component(
            '#payment-row-template',
            '#payment-row-pane',
            paymentData
          ).create();
        }, 'status=pending');

        Queries.adminDashboardSummary(function (summary) {
          if (summary.error === null) {
            $('#total-payment').text(summary.totalPayment);
            $('#total-students').text(summary.totalStudents);
            $('#total-elections').text(summary.totalElections);
            $('#total-positions').text(summary.totalPositions);
            Loading.hide('body');
          }
        });
      }, 'activated=0');
    }, 'activated=0');
  }
  $(document).on('submit', '.activate-student-form', function (e) {
    e.preventDefault();
    $('button', this).attr('disabled', 'true');
    APIRequest.submit({
      url: '/api/students/?_METHOD=PUT',
      context: this,
      success: function (data) {
        if (data.error === null) {
          refreshPage();
        } else {
          console.log(error);
        }
      },
    });
  });

  $(document).on('submit', '.candidate-screening-form', function (e) {
    e.preventDefault();

    $('button', this).attr('disabled', 'true');
    APIRequest.submit({
      url: '/api/candidates/?_METHOD=PUT',
      context: this,
      success: function (data) {
        if (data.error === null) {
          refreshPage();
        } else {
          console.log(error);
        }
      },
    });
  });

  if (isCurrentPage('#admin-payment-page')) {
    Queries.payments(function (paymentData) {
      console.log(paymentData);
      Component(
        '#payment-row-template',
        '#payment-row-pane',
        paymentData
      ).create();
    }, window.location.search.substr(1));
  }

  if (isCurrentPage('#admin-student-page')) {
    Queries.students(function (studentData) {
      Component(
        '#student-row-template',
        '#student-row-pane',
        studentData
      ).create();

      Queries.students(function (disabledAccounts) {
        Component(
          '#disabled-account-row-template',
          '#disabled-account-row-pane',
          disabledAccounts
        ).create();
      }, window.location.search.substr(1) + '&activated=0&disabled=1');
    }, window.location.search.substr(1) + '&activated=1');
  }

  $(document).on('click', '.delete-student-form', function (e) {
    e.preventDefault();
    $('button', this).attr('disabled', 'true');
    APIRequest.submit({
      url: '/api/students/?_METHOD=DELETE',
      context: this,
      success: function (data) {
        if (data.error === null) {
          refreshPage();
        } else {
          console.log(data.error);
        }
      },
    });
  });

  if (isCurrentPage('#admin-candidate-page')) {
    Queries.candidates(function (candidateData) {
      console.log(candidateData);
      Component(
        '#candidate-row-template',
        '#candidate-row-pane',
        candidateData
      ).create();
    }, window.location.search.substr(1));
  }

  $(document).on('click', '.update-payment-form', function (e) {
    e.preventDefault();
    APIRequest.submit({
      url: '/api/payments/?_METHOD=PUT',
      context: this,
      success: function (data) {
        if (data.error === null) {
          refreshPage();
        } else {
          console.log(data.error);
        }
      },
    });
  });

  if (isCurrentPage('#election-result-page')) {
    // var electionId = $('#election-result-page').attr('data-id');
    // Queries.electionresult(function (electionResult) {
    //   console.log(electionResult);
    // }, 'electionid=' + electionId);
  }

  $('#searchquery').on('keyup', function (e) {
    e.preventDefault();

    var text = $(this).val();
    if (text.length > 0) $('#searchresult').addClass('show');
    else return $('#searchresult').removeClass('show');

    Queries.elections(function (electionData) {
      console.log(electionData);
      Component(
        '#election-search-result-template',
        '#election-search-result',
        electionData
      ).create();
    }, 'title=' + text);
  });

  $(document).on('click', 'body', function (e) {
    $('#searchresult').removeClass('show');
  });

  $(document).on('click', '.view-election-result', function (e) {
    e.preventDefault();
    var electionId = $(this).attr('data-id');
    var electionTitle = $(this).attr('data-text');
    $('#searchquery').val(electionTitle);
    $('#searchquery').attr('disabled', 'true');

    Queries.electionresult(function (electionResultData) {
      $('#searchquery').removeAttr('disabled');

      if (electionResultData.error === null) {
        if (electionResultData.electionResults)
          electionResultData.electionTitle = electionTitle;

        Component(
          '#election-result-template',
          '#election-result-pane',
          electionResultData
        ).create();
      }
    }, 'electionid=' + electionId);
  });

  if (isCurrentPage('#student-profile-page')) {
    Queries.currentUser(function (userData) {
      Component('#profile-template', '#profile-pane', userData).create();
    });

    $('#reset-password-form').on('submit', function (e) {
      e.preventDefault();

      var errors = {};

      validate(errors, $(this).serializeArray(), {
        password: {
          handler: 'isStrongPassword',
          message:
            'it must have an alphabet <br/> it must have a number <br/> it must be at least 6 characters ',
        },
      });

      if ($('#password').val() !== $('#confirmPassword').val()) {
        errors['confirmPassword'] = 'password mismatch';
      } else {
        $('#confirmPasswordError').html('');
      }

      $('button', this).attr('disabled', 'true');

      if ($.isEmptyObject(errors)) {
        APIRequest.submit({
          url: '/api/student/changepassword/?_METHOD=PUT',
          context: this,
          success: function (data) {
            if (data.error === null) {
              // logout user
              refreshPage('/logout/');
            } else {
              showErrors(data.error);
            }
          },
        });
      } else {
        showErrors(errors);
        $('button', this).removeAttr('disabled');
      }
    });

    $('#file-uploader').on('change', function (e) {
      e.preventDefault();
      Loading.show('#change-avatar');
      APIRequest.submit({
        url: '/api/student/changeavatar/',
        context: '#file-upload-form',
        success: function (data) {
          Loading.hide('#change-avatar');
          if (data.error === null) {
            $('#new-avatar').attr('src', data.avatar);
            refreshPage('/student/profile/', '500');
          } else {
            showErrors(data.error);
          }
        },
      });
    });

    $(document).on('submit', '#update-student-form', function (e) {
      e.preventDefault();
      var errors = {};
      validate(errors, $(this).serializeArray());

      $('button', this).attr('disabled', 'true');

      if ($.isEmptyObject(errors)) {
        APIRequest.submit({
          url: '/api/students/?_METHOD=PUT',
          context: this,
          success: function (data) {
            if (data.error === null) {
              refreshPage();
            } else {
              showErrors(error);
            }
          },
        });
      } else {
        showErrors(errors);
      }
    });
  }

  $('#new-admin-form').on('submit', function (e) {
    e.preventDefault();
    var errors = {};
    validate(errors, $(this).serializeArray(), {
      password: {
        handler: 'isStrongPassword',
        message:
          'it must have an alphabet <br /> it must have a digit <br /> it must be at least 6 characters.',
      },
      emailAddress: {
        handler: 'isEmail',
        message: 'Please provide a valid email address',
      },
      confirmPassword: {
        handler: 'isMatch',
        message: 'pasword mismatch',
      },
    });

    if ($.isEmptyObject(errors)) {
      Loading.show('body');
      APIRequest.submit({
        url: '/api/admins/',
        context: this,
        success: function (data) {
          Loading.hide('body');
          if (data.error === null) {
            refreshPage('/admin/login/');
          } else {
            showErrors(data.error);
          }
        },
      });
    } else {
      showErrors(errors);
    }
  });

  if (isCurrentPage('#admin-profile-page')) {
    $('#file-uploader').on('change', function (e) {
      e.preventDefault();
      Loading.show('#change-avatar');
      APIRequest.submit({
        url: '/api/admin/changeavatar/',
        context: '#file-upload-form',
        success: function (data) {
          Loading.hide('#change-avatar');
          if (data.error === null) {
            $('#new-avatar').attr('src', data.avatar);
            refreshPage('/admin/profile/', '500');
          } else {
            showErrors(data.error);
          }
        },
      });
    });

    $('#reset-password-form').on('submit', function (e) {
      e.preventDefault();

      var errors = {};

      validate(errors, $(this).serializeArray(), {
        password: {
          handler: 'isStrongPassword',
          message:
            'it must have an alphabet <br/> it must have a number <br/> it must be at least 6 characters ',
        },
        confirmPassword: {
          handler: 'isMatch',
          message: 'password mismatch',
        },
      });

      $('button', this).attr('disabled', 'true');

      if ($.isEmptyObject(errors)) {
        APIRequest.submit({
          url: '/api/admin/changepassword/?_METHOD=PUT',
          context: this,
          success: function (data) {
            if (data.error === null) {
              // logout user
              refreshPage('/logout/');
            } else {
              showErrors(data.error);
            }
          },
        });
      } else {
        showErrors(errors);
        $('button', this).removeAttr('disabled');
      }
    });

    $('#update-admin-form').on('submit', function (e) {
      e.preventDefault();
      var errors = {};
      validate(errors, $(this).serializeArray());

      $('button', this).attr('disabled', 'true');

      if ($.isEmptyObject(errors)) {
        APIRequest.submit({
          url: '/api/admins/?_METHOD=PUT',
          context: this,
          success: function (data) {
            if (data.error === null) {
              refreshPage();
            } else {
              showErrors(error);
            }
          },
        });
      } else {
        showErrors(errors);
      }
    });
  }

  $('#contact-us-form').on('submit', function (e) {
    e.preventDefault();

    var errors = {};
    validate(errors, $(this).serializeArray());

    if ($.isEmptyObject(errors)) {
      Loading.show('#contact-us-form');
      APIRequest.submit({
        url: '/api/mailer/contactus/',
        context: this,
        success: function (data) {
          Loading.hide('#contact-us-form');
          $.each($(this).serializeArray(), function (_, fields) {
            $('[name="' + field.name + '"]').val('');
          });
          if (data.error === null) {
            alert('message sent');
          } else {
            alert('sending failed');
          }
        },
      });
    } else {
      showErrors(errors);
    }
  });
});

if ($('#student-makepayment-page').length > 0) {
  Loading.show('body');
}

if ($('#student-vote-page').length > 0) {
  Loading.show('body');
}

if ($('#admin-dashboard').length > 0) {
  Loading.show('body');
}

//-- Handles realTime Events
var socket = io();
$(document).on('click', '.voting-form', function (e) {
  e.preventDefault();

  var studentId = $('#student-vote-page').attr('data-student-id');
  var voteData = { studentId: studentId };

  $.each($(this).serializeArray(), function (_, field) {
    voteData[field.name] = field.value;
  });
  socket.emit('vote', voteData);
  return;
});

socket.on('newVote', function (voteData) {
  for (let cid in voteData.totalVotes) {
    $('#vote-counter-' + cid).text(voteData.totalVotes[cid]);
  }
});
