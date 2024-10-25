export const createNotificationMessage = (type, payload) => {
    switch (type) {
        case NOTIFICATION_TYPES.ARTICLE_EVENT:
            return `An article has been ${payload.actionType}: "${payload.title}"`;
        case NOTIFICATION_TYPES.BENEFIT_EVENT:
            return `A benefit has been ${payload.actionType}: ${payload.benefitId}`;
        case NOTIFICATION_TYPES.CLIENT_EVENT:
            return `A client has been ${payload.actionType}: ${payload.clientId}`;
        case NOTIFICATION_TYPES.COMMENT_EVENT:
            return `${payload.username} commented: "${payload.commentText}"`;
        case NOTIFICATION_TYPES.DEPARTMENT_EVENT:
            return `A department has been ${payload.actionType}: ${payload.departmentId}`;
        case NOTIFICATION_TYPES.DOWNVOTE_EVENT:
            return `${payload.username} downvoted ${payload.targetType}: ${payload.targetId}`;
        case NOTIFICATION_TYPES.EXPENSE_EVENT:
            return `An expense has been ${payload.actionType}: ${payload.expenseId}`;
        case NOTIFICATION_TYPES.EXPERTISE_EVENT:
            return `An expertise has been ${payload.actionType}: ${payload.expertiseId}`;
        case NOTIFICATION_TYPES.INCOME_EVENT:
            return `An income has been ${payload.actionType}: ${payload.incomeId}`;
        case NOTIFICATION_TYPES.INSURANCE_EVENT:
            return `An insurance has been ${payload.actionType}: ${payload.insuranceId}`;
        case NOTIFICATION_TYPES.INVESTMENT_EVENT:
            return `An investment has been ${payload.actionType}: ${payload.investmentId}`;
        case NOTIFICATION_TYPES.INVOICE_EVENT:
            return `An invoice has been ${payload.actionType}: ${payload.invoiceId}`;
        case NOTIFICATION_TYPES.LOAN_EVENT:
            return `A loan has been ${payload.actionType}: ${payload.loanId}`;
        case NOTIFICATION_TYPES.PAYMENT_EVENT:
            return `A payment has been ${payload.actionType}: ${payload.paymentId}`;
        case NOTIFICATION_TYPES.PERMISSION_EVENT:
            return `A permission has been ${payload.actionType}: ${payload.permissionId}`;
        case NOTIFICATION_TYPES.PRIORITY_EVENT:
            return `A priority has been ${payload.actionType}: ${payload.priorityId}`;
        case NOTIFICATION_TYPES.PROJECT_EVENT:
            return `A project has been ${payload.actionType}: ${payload.projectId}`;
        case NOTIFICATION_TYPES.REVENUE_EVENT:
            return `Revenue has been ${payload.actionType}: ${payload.revenueId}`;
        case NOTIFICATION_TYPES.ROLE_EVENT:
            return `A role has been ${payload.actionType}: ${payload.roleId}`;
        case NOTIFICATION_TYPES.SALARY_EVENT:
            return `A salary has been ${payload.actionType}: ${payload.salaryId}`;
        case NOTIFICATION_TYPES.SAVING_EVENT:
            return `A saving has been ${payload.actionType}: ${payload.savingId}`;
        case NOTIFICATION_TYPES.TEAM_EVENT:
            return `A team has been ${payload.actionType}: ${payload.teamId}`;
        case NOTIFICATION_TYPES.TESTIMONIAL_EVENT:
            return `A testimonial has been ${payload.actionType}: ${payload.testimonialId}`;
        case NOTIFICATION_TYPES.TOKEN_EVENT:
            return `A token has been ${payload.actionType}: ${payload.tokenId}`;
        case NOTIFICATION_TYPES.UPVOTE_EVENT:
            return `${payload.username} upvoted ${payload.targetType}: ${payload.targetId}`;
        case NOTIFICATION_TYPES.USER_EVENT:
            return `User ${payload.username} has been ${payload.actionType}`;
        case NOTIFICATION_TYPES.VIEW_EVENT:
            return `${payload.username} viewed ${payload.targetType}: ${payload.targetId}`;
        default:
            return 'An unknown event occurred.';
    }
};
